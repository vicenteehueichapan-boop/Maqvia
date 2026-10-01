declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    /** Only "sites" after its auth edge is verified to strip incoming identity headers. */
    AUTH_TRUSTED_PROXY?: string;
  }
}
