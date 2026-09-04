# SPEC 07 — Vinculación real de padres (Resend + Supabase Auth + invitations)

> **Status:** Implementado
> **Depends on:** SPEC 03, SPEC 05, SPEC 07 (database-setup)
> **Date:** 2026-09-03
> **Objective:** Reemplazar el flujo mock de "Vincular padre" (SPEC 05) con una implementación real: enviar invitación por email vía Resend, crear usuario en Supabase Auth con status pending, persistir el vínculo en `parent_children`, y permitir que el padre active su cuenta desde `/activate?code=XXXXX`.

## Scope

**In:**

- Tabla `invitations` para almacenar códigos de invitación con estado (code, child_id, parent_email, parent_name, relationship, expires_at, used_at).
- RLS policies en `invitations` (staff puede crear, anyone puede verificar un código no expirado).
- Server action `sendInvitation` en `app/actions/invitations.ts`: valida datos, genera código aleatorio de 5 caracteres, inserta en `invitations`, envía email vía Resend con el código + enlace de activación.
- Modificar `ParentsSection.tsx` para llamar a `sendInvitation` en lugar de agregar el padre al estado local; mostrar feedback (loading, success, error).
- Modificar `/activate` para aceptar `?code=XXXXX`: verificar código válido en `invitations`, si existe y no expiró, permitir al padre crear su cuenta con email/password, y al activar: crear usuario en Supabase Auth con status `pending`, insertar en `parent_children` con `relationship` del invitación, marcar invitación como `used_at`, redirigir a `/login`.
- Configurar Resend: instalar paquete, agregar `RESEND_API_KEY` a `.env`, crear email template simple (solo código + enlace).
- El modal de vincular padre ahora cierra con éxito después de enviar la invitación (no agrega padre al estado local).
- Mantener el diseño visual del modal idéntico a `vincular-padre.dc.html`.

**Out of scope (for future specs):**

- Template de email elaborado con branding/logo.
- Reenviar invitación si el padre no la usa.
- Editar o eliminar padres ya vinculados.
- Notificar al staff cuando el padre active su cuenta.
- Multi-factor authentication o login social.
- Validar que el email no esté ya registrado en `users`.

## Data model

### Nueva tabla: `invitations`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `child_id` | `uuid` FK → `children` | niño al que se vincula |
| `parent_email` | `text` | email del padre/madre |
| `parent_name` | `text` | nombre del padre/madre |
| `relationship` | `relationship_type` | father / mother / guardian |
| `code` | `text` UNIQUE | código de 5 caracteres (mayúscula + dígitos) |
| `status` | `text` | default `'pending'`, cambia a `'accepted'` o `'expired'` |
| `expires_at` | `timestamptz` | `now() + interval '7 days'` |
| `used_at` | `timestamptz` | nullable, fecha de activación |
| `created_at` | `timestamptz` | `now()` |

**RLS:**
- Staff con rol `staff` en el mismo daycare puede INSERT en `invitations`.
- ANY authenticated user puede SELECT solo su propia invitación (por email).
- ANY user (incluso sin auth) puede verificar un código específico (para la pantalla de activación).

**Índices:** UNIQUE en `code`, índice en `child_id`, índice en `parent_email`.

### Modificaciones en `ParentsSection.tsx`

El componente client pasa de agregar el padre al estado local a llamar una server action:

```ts
// app/actions/invitations.ts
"use server";

export async function sendInvitation(data: {
  childId: string;
  parentName: string;
  parentEmail: string;
  relationship: "mother" | "father" | "guardian";
}) {
  // 1. Validar que el child existe y pertenece al daycare del staff actual
  // 2. Generar código aleatorio de 5 caracteres
  // 3. Insertar en invitations con expires_at = now() + 7 days
  // 4. Enviar email via Resend con código + enlace de activación
  // 5. Retornar { success: true } o { error: string }
}
```

### Flujo de activación

1. Padre recibe email con código `XXXXX` y enlace `/activate?code=XXXXX`.
2. Al cargar `/activate?code=XXXXX`, verificar que el código existe en `invitations` y no está expirado.
3. Mostrar pantalla con: nombre del niño, código de invitación, campo email (prellenado si coincide con el de la invitación), campo contraseña, checkbox de autorización, botón "Activar mi cuenta".
4. Al activar:
   - Crear usuario en Supabase Auth con `email` y `password`.
   - Insertar en `users` con `status: 'pending'`, `role: 'parent'`, `full_name`, `daycare_id` del niño.
   - Insertar en `parent_children` con `parent_id`, `child_id`, `relationship`.
   - Marcar `invitations.used_at = now()`, `status = 'accepted'`.
   - Redirigir a `/login`.

## Implementation plan

> Cada step se verifica con `npx tsc --noEmit` + `npm run lint` antes de continuar.

1. **Instalar Resend:**
   - `npm install resend`
   - Agregar `RESEND_API_KEY` a `.env` (valor a configurar por el usuario)
   - Crear `lib/email.ts` con función `sendInvitationEmail(to, code, activationUrl)` usando Resend.

2. **Crear migración para `invitations`:**
   - `supabase/migrations/031_create_invitations_table.sql`
   - Tabla + RLS policies + índices.
   - Aplicar con `supabase_apply_migration`.

3. **Crear server action `sendInvitation`:**
   - `app/actions/invitations.ts` con `"use server"`.
   - Validar child existe, generar código único, insertar en `invitations`.
   - Enviar email vía Resend con código + URL de activación (`${NEXT_PUBLIC_APP_URL}/activate?code=${code}`).
   - Agregar `NEXT_PUBLIC_APP_URL` a `.env`.

4. **Modificar `ParentsSection.tsx`:**
   - Agregar prop `childId` (necesaria para la server action).
   - Reemplazar `handleSend` para llamar `sendInvitation({ childId, name, email, relationship })`.
   - Agregar estado de loading y feedback visual (spinner en botón, mensaje de éxito/error).
   - Al éxito: cerrar modal, no agregar padre al estado local (el padre real aparecerá al recargar).
   - Al error: mostrar mensaje sin cerrar el modal.

5. **Modificar `/kids/[id]/page.tsx`:**
   - Pasar `child.id` como prop a `<ParentsSection childId={child.id} ... />`.

6. **Modificar `/activate` para aceptar códigos de invitación:**
   - `app/(auth)/activate/page.tsx`: leer `?code=XXXXX` del query params.
   - Si hay código, verificar en `invitations` (usar server action o server component).
   - Si código válido y no expirado: mostrar pantalla de activación con datos prellenados.
   - Si código inválido/expirado: mostrar error.
   - Si no hay código: mantener el comportamiento actual (SPEC 03 mock).

7. **Crear server action `activateFromInvitation`:**
   - `app/actions/invitations.ts` (o nuevo archivo).
   - Verificar código válido y no expirado.
   - Crear usuario en Supabase Auth con email/password.
   - Insertar en `users` con `status: 'pending'`, `role: 'parent'`.
   - Insertar en `parent_children`.
   - Marcar invitación como usada.
   - Retornar { success: true } o { error: string }.

8. **Verificación final:**
   - `npx tsc --noEmit` sin errores.
   - `npm run lint` sin errores.
   - `npm run build` exitoso.
   - Flujo completo: staff envía invitación → padre recibe email → padre activa cuenta → padre aparece en lista de padres del niño con status pending.

## Acceptance criteria

- [x] `npm run dev` muestra `/kids/[id]` sin errores en consola.
- [x] `npm install resend` agrega el paquete a `package.json` y `node_modules`.
- [x] La tabla `invitations` existe en Supabase con RLS habilitada.
- [x] La migración `031_create_invitations_table.sql` se aplicó sin errores.
- [x] `RESEND_API_KEY` y `NEXT_PUBLIC_APP_URL` están configurados en `.env`.
- [x] El botón "Enviar invitación" en el modal llama a `sendInvitation` y muestra loading state.
- [x] Si el email es inválido o el nombre está vacío, se muestra error sin llamar al servidor.
- [x] Si la server action falla, se muestra mensaje de error y el modal no se cierra.
- [x] Si la server action tiene éxito, el modal se cierra y el padre no aparece en la lista local (aparece al recargar).
- [x] El email enviado por Resend contiene el código de 5 caracteres y un enlace de activación.
- [x] `/activate?code=XXXXX` muestra la pantalla de activación con el código verificado.
- [x] Si el código es inválido o expirado, se muestra un mensaje de error.
- [x] Al activar la cuenta con email/password válido, se crea el usuario en Supabase Auth.
- [x] Se inserta el vínculo en `parent_children` con el relationship correcto.
- [x] La invitación se marca como `used_at` y `status = 'accepted'`.
- [x] El padre es redirigido a `/login` después de activar.
- [x] El padre aparece en la lista de padres del niño con status `pending`.
- [x] `npx tsc --noEmit` y `npm run lint` pasan sin errores.
- [x] `npm run build` completa exitosamente.

## Decisions

- **Sí:** Tabla `invitations` para almacenar códigos con expiración. **No:** almacenar el código en `users` o `parent_children` (separación de concerns).
- **Sí:** Resend para enviar emails (paquete oficial de Node). **No:** Supabase Edge Functions para emails (más complejo, Resend es más simple para este caso).
- **Sí:** Email simple con código + enlace. **No:** template elaborado con branding (se hará en otro spec).
- **Sí:** Activar cuenta desde `/activate?code=XXXXX`. **No:** ruta separada `/activate-invitation` (reutilizar la ruta existente simplifica el flujo).
- **Sí:** Crear usuario en Supabase Auth con status `pending`. **No:** crear usuario con status `active` directamente (el staff debe aprobar).
- **Sí:** Código aleatorio de 5 caracteres (mayúscula + dígitos). **No:** código más largo o solo numérico.
- **Sí:** Server actions para `sendInvitation` y `activateFromInvitation`. **No:** API routes (server actions son más simples y seguras en Next.js App Router).
- **Sí:** Expiración de 7 días en la base de datos (`expires_at`). **No:** expiración solo en el cliente.

## Risks

| Risk | Mitigation |
|------|------------|
| Resend API key no configurada o inválida | Agregar validación en server action y mostrar error amigable. Documentar que el usuario debe configurar `RESEND_API_KEY`. |
| RLS policies bloquean la inserción de invitaciones | Probar con usuario staff primero; políticas de staff = INSERT en invitations. |
| El código de invitación colisiona (muy improbable con 36^5 = 60M combinaciones) | Manejar error de UNIQUE constraint y reintentar con nuevo código. |
| Supabase Auth requiere email verification antes de login | Configurar `autoConfirm: true` en el flow de invitación o usar `signUp` con `emailRedirectTo`. |
| El padre no recibe el email (spam, dominio no verificado en Resend) | Documentar que Resend requiere dominio verificado para producción; en desarrollo usar sandbox. |
| Next 16 breaking changes con server actions | Mantener convenciones de specs previos; consultar docs si algo rompe. |

## What is **not** in this spec

- Template de email elaborado con branding/logo.
- Reenviar invitación si el padre no la usa.
- Editar o eliminar padres ya vinculados.
- Notificar al staff cuando el padre active su cuenta.
- Validar que el email no esté ya registrado en `users`.

Cada una de ellas, si llega, va en su propio spec.
