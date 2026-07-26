export const main: Record<string, string> = {
  "Host": "student.srmap.edu.in",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Cache-Control": "max-age=0",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Sec-GPC": "1",
  "sec-ch-ua": `"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"`,
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": `"macOS"`
};

export function captcha(jsessionId: string): Record<string, string> {
  return {
    "Host": "student.srmap.edu.in",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "en-GB,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Cookie": `JSESSIONID=${jsessionId}`,
    "Referer": "https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage",
    "Sec-Fetch-Dest": "image",
    "Sec-Fetch-Mode": "no-cors",
    "Sec-Fetch-Site": "same-origin",
    "Sec-GPC": "1",
    "sec-ch-ua": `"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": `"macOS"`
  };
}

export function authenticate(jsessionId: string): Record<string, string> {
  return {
    "Host": "student.srmap.edu.in",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://student.srmap.edu.in",
    "Referer": "https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "sec-ch-ua": `"Chromium";v="146", "Not-A.Brand";v="24", "Brave";v="146"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": `"macOS"`,
    "Sec-GPC": "1",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Cookie": `JSESSIONID=${jsessionId}`,
  };
}

export function basic(jsessionId: string): Record<string, string> {
  return {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'text/html, */*; q=0.01',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': 'https://student.srmap.edu.in',
    'Referer': 'https://student.srmap.edu.in/srmapstudentcorner/HRDSystem',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': `JSESSIONID=${jsessionId}`
  }
}