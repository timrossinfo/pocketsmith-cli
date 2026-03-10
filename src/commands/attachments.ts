import { Command } from 'commander';
import { api, getUserId } from '../api.js';
import { formatOutput } from '../formatter.js';
import type { Attachment } from '../types.js';

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'title', header: 'Title', width: 30 },
  { key: 'file_name', header: 'File', width: 25 },
  { key: 'content_type', header: 'Type', width: 20 },
];

export function registerAttachmentsCommands(program: Command) {
  const attachments = program.command('attachments').description('Manage attachments');

  attachments
    .command('list')
    .description('List attachments')
    .option('--transaction <id>', 'List attachments for a transaction')
    .action(async (opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();

      let data: Attachment[];
      if (opts.transaction) {
        data = await api.get<Attachment[]>(`/transactions/${opts.transaction}/attachments`);
      } else {
        const userId = await getUserId(globalOpts.userId);
        data = await api.get<Attachment[]>(`/users/${userId}/attachments`);
      }

      console.log(formatOutput(data, { json: globalOpts.json, columns }));
    });

  attachments
    .command('get <id>')
    .description('Get attachment details')
    .action(async (id: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.get<Attachment>(`/attachments/${id}`);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  attachments
    .command('update <id>')
    .description('Update an attachment')
    .option('--title <title>', 'Attachment title')
    .action(async (id: string, opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      const data = await api.put<Attachment>(`/attachments/${id}`, body);
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  attachments
    .command('assign <attachment-id> <transaction-id>')
    .description('Assign an attachment to a transaction')
    .action(async (attachmentId: string, transactionId: string, _opts, cmd) => {
      const globalOpts = cmd.optsWithGlobals();
      const data = await api.post<Attachment>(
        `/transactions/${transactionId}/attachments`,
        { attachment_id: parseInt(attachmentId, 10) },
      );
      console.log(formatOutput(data, { json: globalOpts.json }));
    });

  attachments
    .command('unassign <attachment-id> <transaction-id>')
    .description('Unassign an attachment from a transaction')
    .action(async (attachmentId: string, transactionId: string) => {
      await api.delete(`/transactions/${transactionId}/attachments/${attachmentId}`);
      console.log('Attachment unassigned.');
    });

  attachments
    .command('delete <id>')
    .description('Delete an attachment')
    .action(async (id: string) => {
      await api.delete(`/attachments/${id}`);
      console.log('Attachment deleted.');
    });
}
