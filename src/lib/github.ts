const GITHUB_API = 'https://api.github.com'

function getConfig() {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'

  if (!token || !owner || !repo) {
    throw new Error('GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO 환경변수가 설정되지 않았습니다.')
  }

  return { token, owner, repo, branch }
}

async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
): Promise<string | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    },
  )

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub API 오류 (${res.status}): ${await res.text()}`)

  const data = await res.json()
  return data.sha as string
}

/** 파일 생성 또는 업데이트 (텍스트) */
export async function upsertGitHubFile(filePath: string, content: string, message: string) {
  const { token, owner, repo, branch } = getConfig()

  const sha = await getFileSha(token, owner, repo, branch, filePath)
  const encoded = Buffer.from(content, 'utf8').toString('base64')

  const body: Record<string, string> = { message, content: encoded, branch }
  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub 커밋 실패: ${err.message ?? res.status}`)
  }
}

/** 파일 생성 또는 업데이트 (바이너리 — 이미지/PDF 등 첨부 파일용) */
export async function upsertGitHubBinary(
  filePath: string,
  buffer: Buffer,
  message: string,
) {
  const { token, owner, repo, branch } = getConfig()

  const sha = await getFileSha(token, owner, repo, branch, filePath)
  const encoded = buffer.toString('base64')

  const body: Record<string, string> = { message, content: encoded, branch }
  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub 바이너리 커밋 실패: ${err.message ?? res.status}`)
  }
}

/** 파일 삭제 */
export async function deleteGitHubFile(filePath: string, message: string) {
  const { token, owner, repo, branch } = getConfig()

  const sha = await getFileSha(token, owner, repo, branch, filePath)
  if (!sha) throw new Error('GitHub에서 파일을 찾을 수 없습니다.')

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sha, branch }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub 삭제 실패: ${err.message ?? res.status}`)
  }
}
