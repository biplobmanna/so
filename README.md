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
- redis
- docker

### Additional Packages Used

- **auth**
  - `@nestjs/jwt`
  - `@nestjs/passport`
  - `passport`
  - `passport-jwt`
  - `argon2` : since `bcrypt` is only limited to first 48 chars
- **db**
  - `@prisma/client`
  - `prisma` (dev deps)
- **cache**
  - `cache-manager`
  - `cache-manager-redis-store` (breaking changed from v3.0.0)
- **websockets**
  - `socket.io`
  - `@nestjs/platform-socket.io` (already includes `socket.io`)
  - `@nestjs/websockets`
- **config**
  - `@nestjs/config`
- **util**
  - `class-transformer`
  - `class-validator`
- **tests**
  - `pactum` : (for e2e test & TDD) APIs are better & easier than `supertest`
  - `dotenv-cli` : to pass `.env.test` env-vars during testing

### Local Environment

```text
OS: W11
Editor: VSCode
DB: postgres @latest on docker
Cache: redis @latest on docker
node: v18.14.0
yarn: 1.22.19
```

### Modules

- auth
  - jwt based authentication
  - signin / signup using email/password
- user
  - user profile related
- so
  - CRUD so
- prisma
  - ORM used instead of sequelize
- redis
  - caching

### Routes

- **auth**
  - PUBLIC    :: POST `/signin`
  - PUBLIC    :: POST `/signup`
- **user**
  - PUBLIC :: GET `/users/:username` : get user by `username`
  - PROTECTED :: PATCH `/users/:username` : update user by `uid`
- **so**
  - PUBLIC    :: GET `/` : get all `so`
  - PUBLIC    :: GET `/so` : get all `so`
  - PUBLIC    :: GET `/so/:sid` : get `so` by `sid`
  - PUBLIC    :: GET `so/users/:username` : get all `so` of user with `username`
  - PUBLIC    :: GET `/so/tag/:tag` :  get all `so` of tag `tag`
  - PROTECTED :: POST `/so` : add new `so`
  - PROTECTED :: PATCH `/so/:sid` : update `so` with `sid`
  - PROTECTED :: DELETE `/so/:sid` : delete `so` with `sid`

All `GET` request, except those using **id** accept pagination query parameters:

- `take`
- `step`
- `orderby`
- `type`

```text
URL/skip=2&take=10&orderby=id&type=desc
```

### Websockets

- only namespace `so` emits data
- send data from client to `addSo` (PROTECTED)
- JWT is passed in the headers `token: <jwt>`

### Yarn Scripts

#### Dev Env Scripts

```json
{
  "db:dev:show": "prisma studio",
  "db:dev:deploy": "prisma migrate deploy",
  "db:dev:rm": "docker compose rm sodev -s -f -v",
  "db:dev:up": "docker compose up sodev -d",
  "db:dev:restart": "yarn db:dev:rm && yarn db:dev:up && timeout 2 && yarn db:dev:deploy",
  "cache:dev:rm": "docker compose rm devcache -s -f -v",
  "cache:dev:up": "docker compose up devcache -d",
  "cache:dev:restart": "yarn cache:dev:rm && yarn cache:dev:up",
  "dev:rm": "yarn db:dev:rm && yarn cache:dev:rm",
  "dev:up": "yarn db:dev:up && yarn cache:dev:up",
  "dev:restart": "yarn db:dev:restart && yarn cache:dev:restart",
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
  "cache:test:rm": "docker compose rm testcache -s -f -v",
  "cache:test:up": "docker compose up testcache -d",
  "cache:test:restart": "yarn cache:test:rm && yarn cache:test:up",
  "test:rm": "yarn db:test:rm && yarn cache:test:rm",
  "test:up": "yarn db:test:up && yarn cache:test:up",
  "test:restart": "yarn db:test:restart && yarn cache:test:restart",
}
```

> If running on **\*nix** based OS's change `timeout 2` to `sleep 2` in the above scripts.
---

### Be Mindful of

- this is **backend only**
- `.env` and `.env.test` are also included which should not be generally included
- Be careful while starting the container the first time, as the situation maybe non-deterministic. It's advisable to be mindful of the migrations, as without them the db will be unusable.
- `redis` containers have volumes attached to them: `cache/dcache` and `cache/tcache` for dev & test respectively. While setting up, create these folders.
- It's better to use `docker compose up` to setup all the containers for the first time, and then use `yarn db:dev:restart` and `yarn db:test:restart` hereon.
- to see the database use `yarn db:dev:show` or equivalent instead of setting up a DB client for ease of use.
- for **websockets** the JWT is passed in the headers `token: <jwt>`
-
