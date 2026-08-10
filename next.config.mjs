import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: { root: projectRoot },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
}

export default nextConfig
