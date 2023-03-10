import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { ConfigService } from '@nestjs/config'; // only for getting PORT

import { AppModule } from '../src/app.module';
import { assert } from 'console';
import { PrismaService } from '../src/prisma/prisma.service';
import { SignupDto } from '../src/auth/dto';

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

	// All tests here
	it('Test Environment Initialized Properly?', () => {
		assert(PORT === 3333);
	});

	// Auth
	describe('Auth', () => {
		const signupDto: SignupDto = {
			email: 'test@mail.com',
			username: 'testuser',
			password: 'test@123',
		};

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
					.withBody(signupDto)
					.expectStatus(201);
			});
			it('invalid signup: email duplicate', () => {
				return pactum
					.spec()
					.post('/signup')
					.withBody(signupDto)
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
					.withBody(signupDto)
					.expectStatus(200)
					.stores('userAccessToken', 'access_token');
			});
			it('invalid signin: email wrong', () => {
				return pactum
					.spec()
					.post('/signin')
					.withBody({
						email: 'wrong@mail.com',
						password: signupDto.password,
					})
					.expectStatus(403);
			});
			it('invalid signin: password wrong', () => {
				return pactum
					.spec()
					.post('/signin')
					.withBody({
						email: signupDto.email,
						password: 'wrong',
					})
					.expectStatus(403);
			});
		});
	});
});
