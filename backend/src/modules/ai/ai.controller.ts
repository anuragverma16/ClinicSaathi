import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chatWithAssistant(@Body() body: { patientId: string; message: string }) {
    const reply = await this.aiService.handleIncomingMessage(body.patientId, body.message);
    return { success: true, reply };
  }

  @Post('generate-followup')
  async triggerFollowup(@Body() body: { patientName: string; diagnosis: string }) {
    const message = await this.aiService.generateFollowUpMessage(body.patientName, body.diagnosis);
    return { success: true, message };
  }
}