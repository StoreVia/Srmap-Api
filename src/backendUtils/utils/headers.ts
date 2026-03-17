export const main: Record<string, string> = {
  "Host": "student.srmap.edu.in",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "host": "student.srmap.edu.in"
};

export function captcha(jsessionId: string): Record<string, string> {
  return {
    "Host": "student.srmap.edu.in",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Connection": "keep-alive",
    "Cookie": `JSESSIONID=${jsessionId}`,
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "host": "student.srmap.edu.in"
  };
};

export function authenticate(jsessionId: string): Record<string, string> {
  return {
    "Host": "student.srmap.edu.in",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:142.0) Gecko/20100101 Firefox/142.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://student.srmap.edu.in",
    "Connection": "keep-alive",
    "Referer": "https://student.srmap.edu.in/srmapstudentcorner/StudentLoginToPortal",
    "Cookie": `JSESSIONID=${jsessionId}`,
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "host": "student.srmap.edu.in"
  };
};

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