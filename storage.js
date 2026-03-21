/**
 * Delegram Storage — DigitalOcean Spaces (S3-compatible)
 * Used by client server for reading/writing client assets
 */
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')

const BUCKET = process.env.DO_SPACES_BUCKET || 'delegram'
const REGION = process.env.DO_SPACES_REGION || 'sfo3'
const PUBLIC_BASE = process.env.DO_SPACES_PUBLIC_URL || 'https://delegram.sfo3.digitaloceanspaces.com'

const s3 = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT || 'https://sfo3.digitaloceanspaces.com',
  region: REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || 'DO00M33EKKK97E89FZZW',
    secretAccessKey: process.env.DO_SPACES_SECRET || 'WKfutydAz12xV+Sd3RhalBIAaHwM37+F0xyKuGgQvPg'
  }
})

async function uploadAsset(subdomain, filename, buffer, contentType) {
  const key = `clients/${subdomain}/assets/${filename}`
  const upload = new Upload({
    client: s3,
    params: { Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType, ACL: 'public-read' }
  })
  await upload.done()
  return `${PUBLIC_BASE}/${key}`
}

async function listAssets(subdomain) {
  const res = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET, Prefix: `clients/${subdomain}/assets/`
  }))
  return (res.Contents || []).map(o => ({ key: o.Key, url: `${PUBLIC_BASE}/${o.Key}`, size: o.Size, lastModified: o.LastModified }))
}

async function deleteAsset(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

module.exports = { s3, uploadAsset, listAssets, deleteAsset, PUBLIC_BASE, BUCKET }
