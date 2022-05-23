import { Test, TestingModule } from '@nestjs/testing';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { validUserEntity } from './test_data/user.testData';
import { validEventEntity } from './test_data/event.testData';
import { EmailService } from '../src/email/email.service';
import { EmailModule } from '../src/email/email.module';

describe('EmailService (e2e)', () => {
  let emailService: EmailService;

  beforeAll(async () => {
    const etherealAccount = await nodemailer.createTestAccount();
    process.env['MAIL_HOST'] = etherealAccount.smtp.host;
    process.env['MAIL_PORT'] = etherealAccount.smtp.port.toString();
    process.env['MAIL_USER'] = etherealAccount.user;
    process.env['MAIL_PASSWORD'] = etherealAccount.pass;
    process.env['MAIL_FROM'] = `No Reply <${etherealAccount.user}>`;

    const module: TestingModule = await Test.createTestingModule({
      imports: [EmailModule],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  afterAll(async () => {
    await emailService['mailerService']['transporter'].close();
  });

  describe('sendUserConfirmation', () => {
    it('should send email to correct recipient', async () => {
      const message = await emailService.sendInvoice(
        validUserEntity,
        validEventEntity,
        'test-invoice-id',
        10,
      );
      // The URL can be used to display the message in the browser.
      // By appending /message.eml, the plaintext can be downloaded instead.
      const url = nodemailer.getTestMessageUrl(message) || '';
      const plaintextMessage = (await axios.get(url + '/message.eml')).data;
      expect(plaintextMessage).toContain(
        `To: ${validUserEntity.displayName} <${validUserEntity.email}>`,
      );
    });
  });
});
