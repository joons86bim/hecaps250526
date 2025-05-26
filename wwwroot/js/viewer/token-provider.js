/**
 * Autodesk Viewer에 토큰을 공급합니다.
 * @param {function(string, number)} callback - (accessToken, expiresIn) 형태로 호출
 */
export async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token", { credentials: "include" });
    if (!resp.ok) throw new Error(await resp.text());
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See console for more details.");
    console.error(err);
  }
}
