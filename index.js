const fs = require('fs');
const path = require('path');
const { WASI } = require('wasi');

function processPandocArgs(args, CWD) {
  const processedArgs = [];
  const pathOptsWithValue = new Set(['-o', '--output', '--template', '--reference-doc', '--bibliography', '--csl', '--lua-filter', '--data-dir', '--extract-media', '--resource-path']);
  const nonPathOptsWithValue = new Set(['-f', '--from', '-t', '--to', '-w', '--write', '--highlight-style', '--wrap', '--columns', '--dpi', '--eol']);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (pathOptsWithValue.has(arg)) {
      if (i + 1 < args.length) {
        processedArgs.push(arg, path.resolve(CWD, args[i + 1]));
        i++;
      } else {
        processedArgs.push(arg);
      }
      continue;
    }

    if (nonPathOptsWithValue.has(arg)) {
      if (i + 1 < args.length) {
        processedArgs.push(arg, args[i + 1]);
        i++;
      } else {
        processedArgs.push(arg);
      }
      continue;
    }

    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, value] = arg.split('=', 2);
      if (pathOptsWithValue.has(key)) {
        processedArgs.push(`${key}=${path.resolve(CWD, value)}`);
      } else {
        processedArgs.push(arg);
      }
      continue;
    }

    if (!arg.startsWith('-') || arg === '-') {
      if (arg === '-') {
        processedArgs.push(arg);
      } else {
        processedArgs.push(path.resolve(CWD, arg));
      }
    } else {
      processedArgs.push(arg);
    }
  }
  return processedArgs;
}

// If running directly, prepare args for pandoc.
// Otherwise, use the process args, which is the original behavior for module usage.
let pandocArgs = process.argv;
if (require.main === module) {
  const CWD = process.cwd();
  const args = process.argv.slice(2);
  const processedArgs = processPandocArgs(args, CWD);
  pandocArgs = ['pandoc', ...processedArgs];
}

// 实例化 WASI
const wasi = new WASI({
  args: pandocArgs,
  env: {},
  preopens: {
    '/': '/'
  },
  version: 'unstable'
});

const wasmPath = path.join(__dirname, 'pandoc.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

async function runPandoc() {
  const wasmModule = await WebAssembly.compile(wasmBuffer);
  const instance = await WebAssembly.instantiate(wasmModule, { wasi_snapshot_preview1: wasi.wasiImport });

  try {
    wasi.start(instance);
  } catch (err) {
    // WASI 正常退出时会抛出错误，需要捕获它
    // 通常可以忽略这个错误，除非需要处理特定的退出码
    // console.error(err);
  }
}

module.exports = { runPandoc };

// 如果直接通过 node 运行此文件，则执行 pandoc
if (require.main === module) {
  // Argument processing is now done before wasi instantiation.
  runPandoc();
}
