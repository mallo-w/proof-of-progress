# Déploiement — Email de rappel J-1 (`send-deadline-reminders`)

Ce guide explique comment déployer la **Supabase Edge Function** qui envoie un
email de rappel 24h avant la deadline de chaque commitment `active` ou
`submitted`, puis comment l'automatiser via un **cron job** (pg_cron).

- **Fonction** : `supabase/functions/send-deadline-reminders/index.ts`
- **Service d'envoi** : [Resend](https://resend.com) (gratuit jusqu'à 3 000 emails/mois)
- **Déclenchement** : cron pg_cron toutes les jours à 08h00 UTC

---

## 0. Prérequis : créer un compte Resend

1. Créez un compte sur [resend.com](https://resend.com).
2. Dans **API Keys**, cliquez sur **Create API Key**, copiez la clé (format `re_...`).
3. **Expéditeur (2 options)** :
   - **Test rapide** : n'ajoutez rien, la fonction utilise par défaut
     `onboarding@resend.dev` (fonctionne immédiatement, mais uniquement vers
     votre propre adresse Resend en mode test).
   - **Production** : dans **Domains**, ajoutez et vérifiez `system-strategy.co`
     (ajout des enregistrements DNS SPF/DKIM). Vous pourrez alors envoyer depuis
     `noreply@system-strategy.co` à n'importe quelle adresse.

---

## 1. Installer le Supabase CLI

```bash
npm install -g supabase
```

Vérifiez l'installation :

```bash
supabase --version
```

> Alternative sans installation globale : `npx supabase <commande>`.

---

## 2. Se connecter au CLI

```bash
supabase login
```

Cela ouvre le navigateur pour générer un token d'accès. Collez-le si demandé.

---

## 3. Lier le projet local au projet Supabase

Vous avez besoin du **project-ref** (identifiant du projet).

**Où le trouver ?**
- Dashboard Supabase → **Project Settings** → **General** → champ **Reference ID**
- Ou dans l'URL du dashboard : `https://supabase.com/dashboard/project/<PROJECT_REF>`

Depuis la racine du repo (`proof-of-progress/`) :

```bash
supabase link --project-ref <PROJECT_REF>
```

---

## 4. Configurer les secrets de la fonction

La fonction a besoin de deux secrets (le `SUPABASE_URL` et le
`SUPABASE_SERVICE_ROLE_KEY` par défaut sont injectés automatiquement par la
plateforme, mais on définit explicitement la service role key par sécurité).

**Où trouver la Service Role Key ?**
- Dashboard Supabase → **Project Settings** → **API** → section
  **Project API keys** → clé **`service_role`** (⚠️ secrète, ne jamais exposer côté client).

```bash
supabase secrets set \
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...service_role...
```

**(Optionnel)** pour envoyer depuis votre domaine vérifié :

```bash
supabase secrets set RESEND_FROM="Proof of Progress <noreply@system-strategy.co>"
```

Vérifiez les secrets enregistrés :

```bash
supabase secrets list
```

---

## 5. Déployer la fonction

```bash
supabase functions deploy send-deadline-reminders
```

Une fois déployée, l'URL est :

```
https://<PROJECT_REF>.supabase.co/functions/v1/send-deadline-reminders
```

### Test manuel (facultatif)

```bash
curl -X POST \
  "https://<PROJECT_REF>.supabase.co/functions/v1/send-deadline-reminders" \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Réponse attendue (JSON) :

```json
{ "ok": true, "matched": 2, "sent": 2, "failed": 0, "failures": [] }
```

> `<ANON_KEY>` = Dashboard → **Project Settings** → **API** → clé **`anon` `public`**.

---

## 6. Automatiser avec un cron job (pg_cron)

Ouvrez le **SQL Editor** du dashboard Supabase et exécutez les commandes suivantes.

### 6.1 Activer les extensions nécessaires (une seule fois)

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
```

### 6.2 Planifier l'exécution quotidienne (08h00 UTC)

Remplacez `<PROJECT_REF>` et `<ANON_KEY>` par vos valeurs réelles.

```sql
select cron.schedule(
  'send-deadline-reminders',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-deadline-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

> `'0 8 * * *'` = tous les jours à 08h00 UTC. Pour un envoi **toutes les heures**,
> utilisez `'0 * * * *'` (la fenêtre de 23-25h évite les doublons intempestifs,
> mais un envoi horaire peut renvoyer plusieurs rappels : préférez l'exécution
> quotidienne).

### 6.3 Vérifier / gérer le cron

Lister les tâches planifiées :

```sql
select * from cron.job;
```

Voir l'historique d'exécution :

```sql
select * from cron.job_run_details order by start_time desc limit 10;
```

Supprimer / re-planifier la tâche :

```sql
select cron.unschedule('send-deadline-reminders');
```

---

## Récapitulatif des variables

| Variable | Où la trouver | Utilisée par |
|----------|---------------|--------------|
| `PROJECT_REF` | Settings → General → Reference ID | `supabase link`, URL fonction, cron |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → `service_role` | secret fonction |
| `RESEND_API_KEY` | Resend → API Keys | secret fonction |
| `ANON_KEY` | Settings → API → `anon public` | header Authorization du cron / curl |
| `RESEND_FROM` *(optionnel)* | domaine vérifié dans Resend | secret fonction |

---

## Dépannage

- **`failed > 0` avec `Resend 403`** : votre domaine expéditeur n'est pas vérifié,
  ou vous envoyez vers une adresse non autorisée en mode test. Utilisez
  `onboarding@resend.dev` ou vérifiez votre domaine.
- **Aucun email reçu alors que `matched = 0`** : aucun commitment n'a de deadline
  dans la fenêtre 23-25h. Créez un commitment de test avec une deadline demain.
- **Erreur `Missing required environment variables`** : relancez l'étape 4
  (`supabase secrets set`) puis redéployez.
