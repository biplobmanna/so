import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { ConfigService } from '@nestjs/config'; // only for getting PORT

import { AppModule } from '../src/app.module';
import { assert } from 'console';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignupDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { NewSoDto } from '../src/so/dto';

// use the config service to get the PORT
const PORT = new ConfigService().get('PORT');

describe('So Test e2e:', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication(); // nest app instantiate
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    ); // validation middleware
    await app.init(); // initialize app
    await app.listen(PORT); // start server
    prisma = app.get(PrismaService);
    await prisma.cleanDb(); // reset DB
    pactum.request.setBaseUrl('http://localhost:' + PORT); // pactum config
  });

  // closing part
  afterAll(() => {
    app.close();
  });

  // All tests below
  // Testing Environment Setup
  it('Test Environment Initialized Properly?', () => {
    assert(PORT); // PORT properly fetched from config
  });

  // User
  const userDto: SignupDto = {
    email: 'test@mail.com',
    username: 'testuser',
    password: 'test@123',
  };
  // Auth
  describe('Auth', () => {
    describe('Signup', () => {
      it('invalid signup: email empty', () => {
        return pactum
          .spec()
          .post('/signup')
          .withBody({
            email: '',
            password: 'something',
          })
          .expectStatus(400);
      });
      it('invalid signup: password empty', () => {
        return pactum
          .spec()
          .post('/signup')
          .withBody({
            email: 'abc@mail.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('valid signup 1', () => {
        return pactum
          .spec()
          .post('/signup')
          .withBody(userDto)
          .expectStatus(201);
      });
      it('invalid signup: email duplicate', () => {
        return pactum
          .spec()
          .post('/signup')
          .withBody(userDto)
          .expectStatus(403);
      });
    });

    describe('Signin', () => {
      it('invalid signin: email empty', () => {
        return pactum
          .spec()
          .post('/signin')
          .withBody({
            email: '',
            password: 'something',
          })
          .expectStatus(400);
      });
      it('invalid signin: password empty', () => {
        return pactum
          .spec()
          .post('/signin')
          .withBody({
            email: 'abc@mail.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('valid signin 1', () => {
        return pactum
          .spec()
          .post('/signin')
          .withBody(userDto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
      it('invalid signin: email wrong', () => {
        return pactum
          .spec()
          .post('/signin')
          .withBody({
            email: 'wrong@mail.com',
            password: userDto.password,
          })
          .expectStatus(403);
      });
      it('invalid signin: password wrong', () => {
        return pactum
          .spec()
          .post('/signin')
          .withBody({
            email: userDto.email,
            password: 'wrong',
          })
          .expectStatus(403);
      });
    });
  });

  // User
  describe('User', () => {
    describe('Get User By UserName', () => {
      it('Valid Username', () => {
        return pactum
          .spec()
          .get(`/users/${userDto.username}`)
          .expectStatus(200);
      });
      it('Invalid Username', () => {
        return pactum.spec().get(`/users/userdoesntexist`).expectStatus(400);
      });
    });
    describe('Edit User', () => {
      const dto: EditUserDto = {
        email: 'edited@mail.com',
        username: 'editedusername',
      };
      it('Should Edit User: email, username', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.username);
      });
      it('Should Edit User: email only', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody({
            email: dto.email,
          })
          .expectStatus(200)
          .expectBodyContains(dto.email);
      });
      it('Should Edit User: username only', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody({
            username: dto.username,
          })
          .expectStatus(200)
          .expectBodyContains(dto.username);
      });
      it('Should Edit User: blank body', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
      it('Edit back to original username, email', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(userDto)
          .expectStatus(200)
          .expectBodyContains(userDto.email)
          .expectBodyContains(userDto.username);
      });
      it('Unauthorized Access: Wrong Bearer Token', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}x',
          })
          .withBody(dto)
          .expectStatus(401);
      });
    });
  });

  // So
  describe('So', () => {
    const soDto1: NewSoDto = {
      content: 'testing is as time consuming',
      tag: 'programming',
    };
    const soDto2: NewSoDto = {
      content: 'e2e is finicky',
      tag: 'testing',
    };
    it('Get all so from "/" : Empty', () => {
      return pactum.spec().get('/').expectStatus(200).expectBody([]);
    });
    it('Get all so from "/so" : Empty', () => {
      return pactum.spec().get('/').expectStatus(200).expectBody([]);
    });
    it('Add so 1', () => {
      return pactum
        .spec()
        .post('/so')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .withBody(soDto1)
        .expectStatus(201)
        .stores('soId1', 'id')
        .expectBodyContains(soDto1.content)
        .expectBodyContains(soDto1.tag);
    });
    it('Get 1 so', () => {
      return pactum.spec().get('/').expectStatus(200).expectJsonLength(1);
    });
    it('Add so 2', () => {
      return pactum
        .spec()
        .post('/so')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .withBody(soDto2)
        .stores('soId2', 'id')
        .expectStatus(201)
        .expectBodyContains(soDto2.content)
        .expectBodyContains(soDto2.tag);
    });
    it('Get 2 so', () => {
      return pactum.spec().get('/').expectStatus(200).expectJsonLength(2);
    });
    it('Get so1 by id', () => {
      return pactum
        .spec()
        .get('/so/$S{soId1}')
        .expectStatus(200)
        .expectBodyContains(soDto1.content)
        .expectBodyContains(soDto1.tag);
    });
    it('Get so2 by id', () => {
      return pactum
        .spec()
        .get('/so/$S{soId2}')
        .expectStatus(200)
        .expectBodyContains(soDto2.content)
        .expectBodyContains(soDto2.tag);
    });
    it('Get all so by username', () => {
      return pactum
        .spec()
        .get(`/so/users/${userDto.username}`)
        .expectStatus(200)
        .expectJsonLength(2);
    });
    it('Get so1 by tag', () => {
      return pactum
        .spec()
        .get(`/so/tag/${soDto1.tag}`)
        .expectStatus(200)
        .expectBodyContains(soDto1.content)
        .expectBodyContains(soDto1.tag);
    });
    it('Get so2 by tag', () => {
      return pactum
        .spec()
        .get(`/so/tag/${soDto2.tag}`)
        .expectStatus(200)
        .expectBodyContains(soDto2.content)
        .expectBodyContains(soDto2.tag);
    });
    it("Update so1's tag with so2", () => {
      return pactum
        .spec()
        .patch('/so/$S{soId1}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .withBody({
          content: soDto1.content,
          tag: soDto2.tag,
        })
        .expectStatus(200)
        .expectBodyContains(soDto1.content)
        .expectBodyContains(soDto2.tag);
    });
    it('Get both so by tag', () => {
      return pactum
        .spec()
        .get(`/so/tag/${soDto2.tag}`)
        .expectStatus(200)
        .expectJsonLength(2);
    });
    it("Update so2's tag with so1", () => {
      return pactum
        .spec()
        .patch('/so/$S{soId2}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .withBody({
          content: soDto2.content,
          tag: soDto1.tag,
        })
        .expectStatus(200)
        .expectBodyContains(soDto2.content)
        .expectBodyContains(soDto1.tag);
    });
    it('Delete so1 by id', () => {
      return pactum
        .spec()
        .delete('/so/$S{soId1}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .expectStatus(200);
    });
    it('Delete so2 by id', () => {
      return pactum
        .spec()
        .delete('/so/$S{soId2}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .expectStatus(200);
    });
    it('Delete so1 by id again', () => {
      return pactum
        .spec()
        .delete('/so/$S{soId1}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .expectStatus(200)
        .expectBody({
          count: 0,
        });
    });
    it('Delete so2 by id again', () => {
      return pactum
        .spec()
        .delete('/so/$S{soId2}')
        .withHeaders({
          Authorization: 'Bearer $S{userAccessToken}',
        })
        .expectStatus(200)
        .expectBody({
          count: 0,
        });
    });
    it('Get all so : Empty', () => {
      return pactum.spec().get('/').expectStatus(200).expectBody([]);
    });
  });
});
