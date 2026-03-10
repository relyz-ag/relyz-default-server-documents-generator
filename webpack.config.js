
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { RawSource } = require('webpack-sources');

const isProduction = process.env.NODE_ENV === 'production';

class InlineHtmlPlugin {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('InlineHtmlPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'InlineHtmlPlugin',
                    stage: compilation.constructor.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                (assets) => {
                    // Get the compiled CSS
                    const cssAssetName = Object.keys(assets).find(name => name.endsWith('.css'));
                    if (!cssAssetName) return;
                    const cssContent = assets[cssAssetName].source();

                    // Read and base64-encode the SVG logo
                    const svgPath = path.resolve(__dirname, 'assets/logo.svg');
                    const svgContent = fs.readFileSync(svgPath);
                    const svgBase64 = `data:image/svg+xml;base64,${svgContent.toString('base64')}`;

                    // Process each HTML file in documents/
                    const htmlDir = path.resolve(__dirname, 'documents');
                    const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

                    for (const file of htmlFiles) {
                        let html = fs.readFileSync(path.join(htmlDir, file), 'utf-8');

                        // Add HTML files as watch dependencies
                        compilation.fileDependencies.add(path.join(htmlDir, file));

                        // Replace stylesheet link with inline <style>
                        html = html.replace(
                            /<link\s+rel="stylesheet"\s+href="[^"]*main\.css"\s*\/?>/,
                            `<style>${cssContent}</style>`
                        );

                        // Replace image src with base64 data URI
                        html = html.replace(
                            /src="\.\.\/assets\/logo\.svg"/g,
                            `src="${svgBase64}"`
                        );

                        compilation.emitAsset(file, new RawSource(html));
                    }

                    // Watch the SVG as well
                    compilation.fileDependencies.add(path.resolve(__dirname, 'assets/logo.svg'));

                    // Remove intermediate CSS and JS bundles from output
                    for (const name of Object.keys(assets)) {
                        if (name.endsWith('.css') || name.endsWith('.js')) {
                            compilation.deleteAsset(name);
                        }
                    }
                }
            );
        });
    }
}

const config = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, '.build'),
        clean: true,
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new InlineHtmlPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                use: ['ts-loader', 'glob-import-loader'],
                exclude: ['/node_modules/'],
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'glob-import-loader'],
            },
            {
                test: /\.(eot|ttf|woff|woff2)$/i,
                type: 'asset/inline',
            },
            {
                test: /\.(svg|png|jpg|gif)$/i,
                type: 'asset/inline',
            },
        ],
    },
    resolve: {
        alias: {
            '@*': path.resolve(__dirname, '/'),
            'globalstyle$': path.resolve(__dirname, 'src/styles/global.css'),
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
