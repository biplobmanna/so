# So

## So, what is?

So, or `so` is a epiphany sharing application. Ah! You understand.

What? You don't?

Oh, well. So, there have been times when you're aimlessly ruminating or endlessly pursing, you have an epiphany on something - something simple, or something profound, and you desire to share it with more people, well `so` is for you.

Share your epiphanies, what we call `so` (singular & plural) here and let others ruminate over your words.

## Tech Stuff

### Tech Stack

- nodejs
- nestjs
- ts
- postgres
- docker

### Additional Packages Used

- **auth**
  - `@nestjs/jwt`
  - `@nestjs/passport`
  - `passport`
  - `passport-jwt`
  - `argon2` : since `bcrypt` is only limited to 48 chars
- **db**
  - `@prisma/client`
  - `prisma` (dev deps)
- **config**
  - `@nestjs/config`
- **util**
  - `class-transformer`, `class-validator` : for custom param decorators
- **tests**
  - `pactum` : (for e2e test & TDD) APIs are better & easier than `supertest`
  - `dotenv-cli` : to pass `.env.test` env-vars during testing

### Local Environment

```text
OS: W11
NodeJS: v18
Editor: VSCode
Dev Env: W11
Dev DB: Postgres
Dev DB Env: Docker Container w/ Postgres
Test DB Env: Docker Container w/ Postgres
Pacman: yarn
```

### Modules

- auth
  - jwt based authentication
  - signin / signup using email/password
- user
  - user profile related
- so
  - CRUD so

### Routes

- **auth**
  - PUBLIC    :: POST `/signin`
  - PUBLIC    :: POST `/signup`
- **user**
  - PROTECTED :: GET `/user/:username` : get user by `uid`
  - PROTECTED :: PATCH `/user/:username` : update user by `uid`
- **so**
  - PUBLIC    :: GET `/` : get all `so`
  - PUBLIC    :: GET `/so` : get all `so`
  - PUBLIC    :: GET `/so/:sid` : get `so` by `sid`
  - PUBLIC    :: GET `/user/:username/so` : get all `so` of user with `username`
  - PUBLIC    :: GET `/category/tag` :  get all `so` of tag with `tid`
  - PROTECTED :: POST `/so` : add new `so`
  - PROTECTED :: PATCH `/so/:sid` : update `so` with `sid`

### Yarn Scripts

#### Dev Env Scripts

```json
{
  "db:dev:show": "prisma studio",
  "db:dev:deploy": "prisma migrate deploy",
  "db:dev:rm": "docker compose rm sodev -s -f -v",
  "db:dev:up": "docker compose up sodev -d",
  "db:dev:restart": "yarn db:dev:rm && yarn db:dev:up && timeout 2 && yarn db:dev:deploy",
}
```

#### Test Env Scripts

```json
{
  "db:test:show": "dotenv -e .env.test -- prisma studio",
  "db:test:deploy": "dotenv -e .env.test -- prisma migrate deploy",
  "db:test:rm": "docker compose rm sotest -s -f -v",
  "db:test:up": "docker compose up sotest -d",
  "db:test:restart": "yarn db:test:rm && yarn db:test:up && timeout 2 && yarn db:test:deploy",
  "pretest:e2e": "yarn db:test:restart",
  "test:e2e": "dotenv -e .env.test -- jest --watch --no-cache --config ./test/jest-e2e.json"
}
```

> If running on **\*nix** based OS's change `timeout 2` to `sleep 2` in the above scripts.

---

### Some Caveats

- this is backend only
- `.env` and `.env.test` are also included which should not be generally included
