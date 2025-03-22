import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';

export default [
  {
      input: 'src/index.ts',
      output: [
          {
              file: 'dist/bundle.cjs',
              format: 'cjs',
              sourcemap: false,
          },
          {
              file: 'dist/bundle.mjs',
              format: 'es',
              sourcemap: false,
          },
      ],
      plugins: [
          resolve(),
          commonjs(),
          json(),
          typescript({ tsconfig: './tsconfig.json' }),
          terser(),
      ],
  },
  {
      input: 'src/index.ts',
      output: {
          file: 'dist/index.d.ts',
          format: 'es',
      },
      plugins: [
          dts({
              compilerOptions: {
                  "baseUrl": "./",
                  "paths": {
                    "@/*": ["src/*"],
                  }
              },
          }),
      ],
  }
];