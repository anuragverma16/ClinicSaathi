import { Processor, Process } from '@nestjs/bullet';
import { Job } from 'bullmq';
import { AiService } from '../modules/ai/ai.service';

@Processor('ai-jobs')
export class AiJobProcessor {
  constructor(private readonly aiService: AiService) {}

  @Process('send-scheduled-recall')
  async handleScheduledRecall(job: Job) {
    const { patientName, diagnosis, phone } = job.data;
    const message = await this.aiService.generateFollowUpMessage(patientName, diagnosis);
    
    // Yahan WhatsApp Service se message fire hoga
    console.log(`Sending automated WhatsApp AI message to ${phone}: ${message}`);
  }
}