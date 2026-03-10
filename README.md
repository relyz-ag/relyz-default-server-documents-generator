# relyz Default Server Documents Generator

This repository generates self-contained HTML error pages and default documents for the relyz web servers. All assets (CSS, images) are inlined during the build process.

## Build

```bash
npm install
npm run build
```

The built files are output to `.build/`.

For the best workflow, clone the deployment repository and symlink it as `.build`:

```bash
git clone git@github.com:relyz-ag/relyz-default-server-documents.git .build
```

This way, build output goes directly into the deployment repository, making it easy to review, commit and push changes.

## Deployment

The built files must be committed to the deployment repository:

https://github.com/relyz-ag/relyz-default-server-documents

After pushing to the deployment repository, update the SHA-1 hash in the opsserver JSON settings:

```json
{
  "website::default::webroot::gitsource": "git@github.com:relyz-ag/relyz-default-server-documents.git",
  "website::default::webroot::gitrevision": "<SHA-1 of the latest commit>",
  "website::default::webroot::gitkey": "-----BEGIN OPENSSH PRIVATE KEY-----\zAXktdjEABGAaC1AArZ5v...\n-----END OPENSSH PRIVATE KEY-----"
}
```

See: https://docs.opsone.ch/managed-server-10/configuration/website/apache.html#custom-default-webroot
