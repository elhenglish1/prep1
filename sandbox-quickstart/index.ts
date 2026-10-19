import { config } from 'dotenv';
config({ path: '.env.local' });

import { Sandbox } from '@vercel/sandbox';

const SANDBOX_NAME = 'my-sandbox-517251';
const GENERATED_PATH = '/vercel/generated.mjs';

const generatedCode = `console.log('Hello from generated code');\n`;

async function main() {
  const sandbox = await Sandbox.getOrCreate({
    name: SANDBOX_NAME,
    persistent: true,
    networkPolicy: 'deny-all',
  });

  try {
    // getOrCreate ignores creation params for an existing sandbox, so enforce the policy explicitly.
    await sandbox.update({ networkPolicy: 'deny-all' });

    await sandbox.writeFiles([
      { path: GENERATED_PATH, content: Buffer.from(generatedCode) },
    ]);

    const result = await sandbox.runCommand('node', [GENERATED_PATH]);
    const stdout = await result.stdout();
    const stderr = await result.stderr();

    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode ?? 1;
    }
  } finally {
    await sandbox.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
