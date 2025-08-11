// import express from "express";
// import imaps from "imap-simple";
// import { simpleParser } from "mailparser";
// import axios from 'axios';
// import puppeteer from 'puppeteer';
// import fs from 'fs';
// import { glob } from 'glob';
// import { DateTime } from 'luxon';

// // ================== Express Server for OTP Retrieval ==================
// const app = express();

// const config = {
//     imap: {
//         user: "sutariyahit7749@gmail.com",        // your gmail address
//         password: "hldc nqby dhsi tych",  // your gmail app password
//         host: "imap.gmail.com",
//         port: 993,
//         tls: true,
//         tlsOptions: { rejectUnauthorized: false }, // For development only
//         authTimeout: 10000,
//     },
// };

// function extractOtp(text) {
//     const match = text.match(/\b(\d{6})\b/);
//     return match ? match[1] : null;
// }

// async function fetchLatestOtp(fromEmail) {
//     try {
//         const connection = await imaps.connect(config);
//         await connection.openBox("INBOX");

//         const searchCriteria = [["FROM", fromEmail]];
//         const fetchOptions = {
//             bodies: [""],
//             markSeen: false,
//         };

//         const results = await connection.search(searchCriteria, fetchOptions);
//         if (!results.length) {
//             return { error: "No emails found from the specified sender." };
//         }

//         const latestEmail = results[results.length - 1];
//         const raw = latestEmail.parts[0].body;

//         const parsed = await simpleParser(raw);
//         const subject = parsed.subject || "";
//         const date = parsed.date || "";
//         const textBody = parsed.text || "";

//         const otp = extractOtp(textBody);
//         await connection.end();

//         if (otp) {
//             return { otp, subject, date };
//         } else {
//             return { error: "OTP not found in the latest email." };
//         }
//     } catch (err) {
//         return { error: err.message };
//     }
// }

// app.get("/emails", async (req, res) => {
//     const fromEmail = "no-reply@jobs.amazon.com";
//     const result = await fetchLatestOtp(fromEmail);
//     res.json(result);
// });

// // Start the Express server
// const PORT = 3000;
// const server = app.listen(PORT, () => {
//     console.log(`OTP server running on port ${PORT}`);
// });



// async function getChromePath() {
//     // Render.com's default Chrome path (2024)
//     const renderPath = '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux/chrome';

//     try {
//         const matches = glob.sync(renderPath);
//         if (matches[0]) return matches[0];
//     } catch (err) {
//         console.log('Render.com path not found, falling back to Puppeteer.');
//     }

//     return puppeteer.executablePath(); // Default to bundled Chromium
// }


// // ================== Amazon Job Application System ==================
// class AutoJobApply {
//     constructor() {
//         this.email = "sutariyahit7749@gmail.com";
//         this.pin = "778899";
//         this.candidateId = "a5903d60-4798-11f0-ad5c-53d600a1f3dc";
//         this.csrf_token = "";
//         this.aws_waf_token = "";
//         this.session_token = "";
//         this.auth_token = "";
//         this.stop_process = false;
//         this.jobSearchInterval = null;
//         this.tokenRefreshInterval = null;
//         this.axiosInstance = axios.create({
//             timeout: 5000,
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15'
//             }
//         });
//     }

//     async get_csrf_token() {
//         try {
//             const url = 'https://auth.hiring.amazon.com/api/csrf?countryCode=CA';
//             const headers = {
//                 'Access-Control-Allow-Origin': '*',
//                 'Accept': 'application/json, text/plain, */*',
//                 'Sec-Fetch-Site': 'same-origin',
//                 'Accept-Language': 'en-GB,en;q=0.9',
//                 'Accept-Encoding': 'gzip, deflate, br',
//                 'Sec-Fetch-Mode': 'cors',
//                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
//                 'Referer': 'https://auth.hiring.amazon.com/',
//                 'Connection': 'keep-alive',
//                 'Sec-Fetch-Dest': 'empty',
//                 'Priority': 'u=3, i',
//             };

//             const response = await axios.get(url, { headers });
//             if (response.status === 200) {
//                 return response.data.token;
//             } else {
//                 console.log(`Error  ::  Status Code  ::  ${response.status}  ::  ${response.data}`);
//                 return false;
//             }
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    get_csrf_token   ::   ${error}`);
//             return false;
//         }
//     }

//     async sign_in_first_api(csrf_token) {
//         try {
//             const url = 'https://auth.hiring.amazon.com/api/candidate/v2?countryCode=CA';
//             const headers = {
//                 'Content-Type': 'application/json',
//                 'Access-Control-Allow-Origin': '*',
//                 'Accept': 'application/json, text/plain, */*',
//                 'Sec-Fetch-Site': 'same-origin',
//                 'Accept-Language': 'en-GB,en;q=0.9',
//                 'Accept-Encoding': 'gzip, deflate, br',
//                 'Sec-Fetch-Mode': 'cors',
//                 'Origin': 'https://auth.hiring.amazon.com',
//                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
//                 'Referer': 'https://auth.hiring.amazon.com/',
//                 'Connection': 'keep-alive',
//                 'Sec-Fetch-Dest': 'empty',
//                 'Priority': 'u=3, i',
//             };

//             const data = {
//                 "candidateLoginProp": this.email,
//                 "token": csrf_token,
//                 "countryName": "Canada"
//             };

//             const response = await axios.post(url, data, { headers });
//             return response.status === 200;
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    sign_in_first_api   ::   ${error}`);
//             return false;
//         }
//     }

//     async sign_in_second_api(csrf_token) {
//         try {
//             const url = 'https://auth.hiring.amazon.com/api/authentication/verify-sign-in?countryCode=CA';
//             const headers = {
//                 'Content-Type': 'application/json',
//                 'Access-Control-Allow-Origin': '*',
//                 'Accept': 'application/json, text/plain, */*',
//                 'Sec-Fetch-Site': 'same-origin',
//                 'Accept-Language': 'en-GB,en;q=0.9',
//                 'Accept-Encoding': 'gzip, deflate, br',
//                 'Sec-Fetch-Mode': 'cors',
//                 'Origin': 'https://auth.hiring.amazon.com',
//                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
//                 'Referer': 'https://auth.hiring.amazon.com/',
//                 'Connection': 'keep-alive',
//                 'Sec-Fetch-Dest': 'empty',
//                 'Priority': 'u=3, i',
//             };

//             const data = {
//                 "user": this.email,
//                 "pin": this.pin,
//                 "token": csrf_token,
//                 "countryName": "Canada"
//             };

//             const response = await axios.post(url, data, { headers });
//             return response.status === 200;
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    sign_in_second_api   ::   ${error}`);
//             return false;
//         }
//     }

//     async sign_in(csrf_token, aws_waf_token) {
//         try {
//             const url = 'https://auth.hiring.amazon.com/api/authentication/sign-in?countryCode=US';
//             const headers = {
//                 'Content-Type': 'application/json',
//                 'Access-Control-Allow-Origin': '*',
//                 'Accept': 'application/json, text/plain, */*',
//                 'Sec-Fetch-Site': 'same-origin',
//                 'Accept-Language': 'en-AU,en;q=0.9',
//                 'Accept-Encoding': 'gzip, deflate, br',
//                 'Sec-Fetch-Mode': 'cors',
//                 'Origin': 'https://auth.hiring.amazon.com',
//                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
//                 'Referer': 'https://auth.hiring.amazon.com/',
//                 'Connection': 'keep-alive',
//                 'Sec-Fetch-Dest': 'empty',
//                 'Cookie': `aws-waf-token=${aws_waf_token}`,
//                 'Priority': 'u=3, i',
//             };

//             const data = {
//                 "loginType": "email",
//                 "pin": this.pin,
//                 "user": this.email,
//                 "token": csrf_token,
//                 "locale": "en-CA",
//                 "countryName": "Canada"
//             };

//             const response = await axios.post(url, data, { headers });
//             if (response.status === 200) {
//                 return response.data.session;
//             }
//             return false;
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    sign_in   ::   ${error}`);
//             return false;
//         }
//     }


//     async get_aws_waf_token() {
//         try {
//             // const browser = await puppeteer.launch({
//             //     headless: "new",
//             //     args: ['--disable-blink-features=AutomationControlled', '--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
//             //     executablePath: await getChromePath()
//             // });

//             const browser = await puppeteer.launch({
//                 headless: true,
//                 args: ["--no-sandbox", "--disable-setuid-sandbox"]
//             });

//             try {
//                 const page = await browser.newPage();
//                 await page.goto("https://auth.hiring.amazon.com/#/login", { waitUntil: 'networkidle2' });
//                 await new Promise(resolve => setTimeout(resolve, 5000));

//                 const cookies = await page.cookies();
//                 for (const cookie of cookies) {
//                     if (cookie.name === 'aws-waf-token') {
//                         return cookie.value;
//                     }
//                 }
//                 return false;
//             } finally {
//                 await browser.close();
//             }
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    get_aws_waf_token   ::   ${error}`);
//             return false;
//         }
//     }

//     async confirm_amazon_otp(otp, session, csrf_token, aws_waf_token) {
//         try {
//             const url = "https://auth.hiring.amazon.com/api/authentication/confirm-otp?countryCode=CA";
//             const headers = {
//                 "Content-Type": "application/json",
//                 "Access-Control-Allow-Origin": "*",
//                 "Accept": "application/json, text/plain, */*",
//                 "Sec-Fetch-Site": "same-origin",
//                 "Accept-Language": "en-AU,en;q=0.9",
//                 "Accept-Encoding": "gzip, deflate, br",
//                 "Sec-Fetch-Mode": "cors",
//                 "Origin": "https://auth.hiring.amazon.com",
//                 "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
//                 "Referer": "https://auth.hiring.amazon.com/",
//                 "Connection": "keep-alive",
//                 "Sec-Fetch-Dest": "empty",
//                 "CSRF-Token": csrf_token,
//                 'Cookie': `aws-waf-token=${aws_waf_token}`,
//                 "Priority": "u=3, i"
//             };

//             const payload = {
//                 "otp": otp,
//                 "session": session,
//                 "user": this.email,
//                 "token": csrf_token,
//                 "countryName": "Canada",
//                 "countryCode": "CA"
//             };

//             const response = await axios.post(url, payload, { headers });
//             if (response.status === 200) {
//                 return response.data.signInUserSession.accessToken;
//             }
//             return false;
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    confirm_amazon_otp   ::   ${error}`);
//             return false;
//         }
//     }

//     async create_application(jobId, scheduleId, aws_waf_token, auth_token) {
//         try {
//             const url = "https://hiring.amazon.com/application/api/candidate-application/ds/create-application/";
//             const headers = {
//                 "Content-Type": "application/json;charset=utf-8",
//                 "Accept": "application/json, text/plain, */*",
//                 "Authorization": auth_token,
//                 "Sec-Fetch-Site": "same-origin",
//                 "Accept-Language": "en-AU,en;q=0.9",
//                 "Accept-Encoding": "gzip, deflate, br",
//                 "Sec-Fetch-Mode": "cors",
//                 "Origin": "https://hiring.amazon.com",
//                 "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
//                 "Referer": `https://hiring.amazon.com/application/us/?CS=true&jobId=${jobId}&locale=en-CA&scheduleId=${scheduleId}&ssoEnabled=1`,
//                 "Sec-Fetch-Dest": "empty",
//                 "Cookie": `aws-waf-token=${aws_waf_token}`,
//                 "bb-ui-version": "bb-ui-v2",
//                 "Priority": "u=3, i"
//             };

//             const payload = {
//                 "jobId": jobId,
//                 "dspEnabled": true,
//                 "scheduleId": scheduleId,
//                 "candidateId": this.candidateId,
//                 "activeApplicationCheckEnabled": true
//             };

//             const response = await axios.post(url, payload, { headers });
//             return response.status === 200;
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    create_application   ::   ${error}`);
//             return false;
//         }
//     }

//     async get_otp() {
//         try {
//             const response = await axios.get("http://localhost:3000/emails");
//             if (response.status === 200) {
//                 return response.data.otp;
//             }
//             return false;
//         } catch (error) {
//             this.stop_process = true;
//             console.log(`ERROR    ::    Function    ::    get_otp   ::   ${error}`);
//             return false;
//         }
//     }

//     get_canada_current_date() {
//         return DateTime.now().setZone('America/Toronto').toISODate();
//     }

//     async search_amazon_jobs(bearer_token) {
//         try {
//             const current_date_in_canada = this.get_canada_current_date();
//             const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
//             const headers = {
//                 "Content-Type": "application/json",
//                 "Accept": "*/*",
//                 "Authorization": `Bearer Status|logged-in|Session|${bearer_token}`,
//                 "Sec-Fetch-Site": "cross-site",
//                 "Accept-Language": "en-AU,en;q=0.9",
//                 "Accept-Encoding": "gzip, deflate, br",
//                 "Sec-Fetch-Mode": "cors",
//                 "Origin": "https://hiring.amazon.ca",
//                 "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
//                 "Referer": "https://hiring.amazon.ca/",
//                 "Sec-Fetch-Dest": "empty",
//                 "Priority": "u=3, i",
//                 "country": "Canada",
//                 "iscanary": "false"
//             };

//             const payload = {
//                 "operationName": "searchJobCardsByLocation",
//                 "variables": {
//                     "searchJobRequest": {
//                         "locale": "en-CA",
//                         "country": "Canada",
//                         "keyWords": "",
//                         "equalFilters": [
//                             {
//                                 "key": "scheduleRequiredLanguage",
//                                 "val": "en-CA"
//                             }
//                         ],
//                         "containFilters": [
//                             {
//                                 "key": "isPrivateSchedule",
//                                 "val": ["false"]
//                             }
//                         ],
//                         "rangeFilters": [
//                             {
//                                 "key": "hoursPerWeek",
//                                 "range": {
//                                     "minimum": 0,
//                                     "maximum": 80
//                                 }
//                             }
//                         ],
//                         "orFilters": [],
//                         "dateFilters": [
//                             {
//                                 "key": "firstDayOnSite",
//                                 "range": {
//                                     "startDate": current_date_in_canada
//                                 }
//                             }
//                         ],
//                         "sorters": [
//                             {
//                                 "fieldName": "totalPayRateMax",
//                                 "ascending": "false"
//                             }
//                         ],
//                         "pageSize": 100,
//                         "consolidateSchedule": true
//                     }
//                 },
//                 "query": `query searchJobCardsByLocation($searchJobRequest: SearchJobRequest!) {
//                     searchJobCardsByLocation(searchJobRequest: $searchJobRequest) {
//                         nextToken
//                         jobCards {
//                             jobId
//                             jobTitle
//                             jobType
//                             employmentType
//                             city
//                             postalCode
//                             locationName
//                             totalPayRateMin
//                             totalPayRateMax
//                             bonusPay
//                             scheduleCount
//                             __typename
//                         }
//                         __typename
//                     }
//                 }`
//             };

//             const response = await axios.post(url, payload, { headers });
//             if (response.status === 200) {
//                 console.log(`${DateTime.now()},   ${response.data?.data?.searchJobCardsByLocation?.jobCards?.length} Jobs found.`)
//             }
//             if (response.status === 200 && response.data?.data?.searchJobCardsByLocation?.jobCards?.length > 0) {
//                 return response.data.data.searchJobCardsByLocation.jobCards;
//             }
//             return [];
//         } catch (error) {
//             console.log(`ERROR    ::    Function    ::    search_amazon_jobs   ::   ${error}`);
//             return [];
//         }
//     }

//     async search_schedule_cards(bearer_token, job_id) {
//         try {
//             const current_date_in_canada = this.get_canada_current_date();
//             const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
//             const headers = {
//                 "Content-Type": "application/json",
//                 "Accept": "*/*",
//                 "Authorization": `Bearer ${bearer_token}`,
//                 "Sec-Fetch-Site": "cross-site",
//                 "Accept-Language": "en-AU,en;q=0.9",
//                 "Accept-Encoding": "gzip, deflate, br",
//                 "Sec-Fetch-Mode": "cors",
//                 "Origin": "https://hiring.amazon.ca",
//                 "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
//                 "Referer": "https://hiring.amazon.ca/",
//                 "Sec-Fetch-Dest": "empty",
//                 "Priority": "u=3, i",
//                 "country": "Canada",
//                 "iscanary": "false"
//             };

//             const payload = {
//                 "operationName": "searchScheduleCards",
//                 "variables": {
//                     "searchScheduleRequest": {
//                         "locale": "en-CA",
//                         "country": "Canada",
//                         "keyWords": "",
//                         "equalFilters": [],
//                         "containFilters": [
//                             {
//                                 "key": "isPrivateSchedule",
//                                 "val": ["false"]
//                             }
//                         ],
//                         "rangeFilters": [
//                             {
//                                 "key": "hoursPerWeek",
//                                 "range": {
//                                     "minimum": 0,
//                                     "maximum": 80
//                                 }
//                             }
//                         ],
//                         "orFilters": [],
//                         "dateFilters": [
//                             {
//                                 "key": "firstDayOnSite",
//                                 "range": {
//                                     "startDate": current_date_in_canada
//                                 }
//                             }
//                         ],
//                         "sorters": [
//                             {
//                                 "fieldName": "totalPayRateMax",
//                                 "ascending": "false"
//                             }
//                         ],
//                         "pageSize": 1000,
//                         "jobId": job_id,
//                         "consolidateSchedule": true
//                     }
//                 },
//                 "query": `query searchScheduleCards($searchScheduleRequest: SearchScheduleRequest!) {
//                     searchScheduleCards(searchScheduleRequest: $searchScheduleRequest) {
//                         nextToken
//                         scheduleCards {
//                             scheduleId
//                             firstDayOnSite
//                             scheduleText
//                             __typename
//                         }
//                         __typename
//                     }
//                 }`
//             };

//             const response = await axios.post(url, payload, { headers });
//             if (response.status === 200 && response.data?.data?.searchScheduleCards?.scheduleCards?.length > 0) {
//                 return response.data.data.searchScheduleCards.scheduleCards;
//             }
//             return [];
//         } catch (error) {
//             console.log(`ERROR    ::    Function    ::    search_schedule_cards   ::   ${error}`);
//             return [];
//         }
//     }

//     async refreshTokens() {
//         try {
//             console.log("Refreshing tokens...");
//             const { csrf_token, aws_waf_token, session_token, auth_token } = await this.main();
//             if (csrf_token && aws_waf_token && session_token && auth_token) {
//                 this.csrf_token = csrf_token;
//                 this.aws_waf_token = aws_waf_token;
//                 this.session_token = session_token;
//                 this.auth_token = auth_token;
//                 console.log("Tokens refreshed successfully");
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.log(`ERROR    ::    Function    ::    refreshTokens   ::   ${error}`);
//             return false;
//         }
//     }

//     async startTokenRefresh() {
//         try {
//             // Initial token refresh
//             await this.refreshTokens();

//             // Set up periodic refresh every 2 hours
//             this.tokenRefreshInterval = setInterval(async () => {
//                 if (this.stop_process) {
//                     clearInterval(this.tokenRefreshInterval);
//                     return;
//                 }
//                 await this.refreshTokens();
//             }, 7100000); // ~2 hours
//         } catch (error) {
//             console.log(`ERROR    ::    Function    ::    startTokenRefresh   ::   ${error}`);
//             this.stopProcess();
//         }
//     }

//     async find_jobs_every_300ms() {
//         try {
//             let lastExecutionTime = 0;
//             let errorCount = 0;
//             const maxErrorCount = 5;

//             const executeSearch = async () => {
//                 try {
//                     const startTime = Date.now();
//                     const timeSinceLastCall = startTime - lastExecutionTime;
//                     const delayNeeded = Math.max(0, 300 - timeSinceLastCall);

//                     if (delayNeeded > 0) {
//                         await new Promise(resolve => setTimeout(resolve, delayNeeded));
//                     }

//                     if (!this.csrf_token) {
//                         return;
//                     }

//                     const jobs = await this.search_amazon_jobs(this.csrf_token);
//                     if (jobs.length === 0) {
//                         return;
//                     }

//                     console.log(`Found ${jobs.length} jobs at ${new Date().toISOString()}`);

//                     for (const job of jobs) {
//                         if (this.stop_process) break;

//                         const job_details = {
//                             jobId: job.jobId,
//                             jobTitle: job.jobTitle,
//                             jobType: job.jobType,
//                             employmentType: job.employmentType,
//                             city: job.city,
//                             postalCode: job.postalCode,
//                             locationName: job.locationName,
//                             totalPayRateMin: job.totalPayRateMin,
//                             totalPayRateMax: job.totalPayRateMax,
//                             bonusPay: job.bonusPay,
//                             scheduleCount: job.scheduleCount
//                         };

//                         // Write to file asynchronously
//                         fs.appendFile("jobs.json", JSON.stringify(job_details) + "\n", (err) => {
//                             if (err) console.error("Error writing to file:", err);
//                         });

//                         const schedule_response = await this.search_schedule_cards(this.csrf_token, job_details.jobId);
//                         if (schedule_response.length > 0) {
//                             const latestSchedule = schedule_response[0]; // Get first schedule
//                             Object.assign(job_details, {
//                                 scheduleId: latestSchedule.scheduleId,
//                                 firstDayOnSite: latestSchedule.firstDayOnSite,
//                                 scheduleText: latestSchedule.scheduleText
//                             });

//                             if (job_details.jobId && job_details.scheduleId) {
//                                 const applicationSuccess = await this.create_application(
//                                     job_details.jobId,
//                                     job_details.scheduleId,
//                                     this.aws_waf_token,
//                                     this.auth_token
//                                 );

//                                 if (applicationSuccess) {
//                                     console.log("Job Successfully Applied");
//                                     this.stopProcess();
//                                     return;
//                                 }
//                             }
//                         }
//                     }

//                     errorCount = 0; // Reset error count on success
//                 } catch (error) {
//                     errorCount++;
//                     console.error(`Error in job search (attempt ${errorCount}):`, error.message);

//                     if (errorCount >= maxErrorCount) {
//                         console.error("Max error count reached, stopping...");
//                         this.stopProcess();
//                     }
//                 } finally {
//                     lastExecutionTime = Date.now();
//                 }
//             };

//             // Set up the job search interval
//             this.jobSearchInterval = setInterval(executeSearch, 300);

//             // Run initial search immediately
//             await executeSearch();

//             // Keep the function running
//             await new Promise(() => { });

//         } catch (error) {
//             console.error("Fatal error in job search:", error);
//             this.stopProcess();
//         }
//     }

//     stopProcess() {
//         this.stop_process = true;
//         if (this.jobSearchInterval) clearInterval(this.jobSearchInterval);
//         if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);
//         console.log("Process stopped");
//     }

//     async main() {
//         try {
//             const aws_waf_token = await this.get_aws_waf_token();
//             console.log("aws_waf_token   ::   ", aws_waf_token);

//             const csrf_token = await this.get_csrf_token();
//             console.log("csrf_token   ::   ", csrf_token);

//             if (csrf_token && aws_waf_token) {
//                 const first_step_verification = await this.sign_in_first_api(csrf_token);
//                 if (first_step_verification) {
//                     console.log("First step verification successful");

//                     const second_step_verification = await this.sign_in_second_api(csrf_token);
//                     if (second_step_verification) {
//                         console.log("Second step verification successful");

//                         const session_token = await this.sign_in(csrf_token, aws_waf_token);
//                         if (session_token) {
//                             console.log("Sign in successful");
//                             console.log("session_token   ::   ", session_token);

//                             await new Promise(resolve => setTimeout(resolve, 5000));

//                             const otp = await this.get_otp();
//                             console.log("otp   ::   ", otp);
//                             if (otp) {
//                                 const auth_token = await this.confirm_amazon_otp(otp, session_token, csrf_token, aws_waf_token);
//                                 console.log("auth token   ::   ", auth_token);
//                                 return { csrf_token, aws_waf_token, session_token, auth_token };
//                             }
//                         }
//                     }
//                 }
//             }
//         } catch (error) {
//             console.log(`ERROR    ::    Function    ::    main   ::   ${error}`);
//         }
//         return { csrf_token: null, aws_waf_token: null, session_token: null, auth_token: null };
//     }
// }

// // Main execution
// const obj = new AutoJobApply();

// // Handle process termination
// process.on('SIGINT', () => {
//     console.log("\nGracefully shutting down...");
//     obj.stopProcess();
//     server.close(() => {
//         console.log('OTP server closed');
//         process.exit();
//     });
// });

// process.on('SIGTERM', () => {
//     console.log("\nTermination signal received...");
//     obj.stopProcess();
//     server.close(() => {
//         console.log('OTP server closed');
//         process.exit();
//     });
// });

// // Start the processes
// (async () => {
//     try {
//         // Start token refresh in the background
//         obj.startTokenRefresh();

//         // Start job search
//         await obj.find_jobs_every_300ms();
//     } catch (error) {
//         console.error("Initialization error:", error);
//         obj.stopProcess();
//         server.close(() => {
//             console.log('OTP server closed due to error');
//             process.exit(1);
//         });
//     }
// })();


const browser = await puppeteer.launch({
  executablePath: '/opt/render/.cache/puppeteer/chrome-139.0.7258.66/chrome-linux/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
