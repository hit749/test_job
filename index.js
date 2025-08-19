const axios = require("axios");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { DateTime } = require("luxon");
const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const express = require("express");
const nodemailer = require('nodemailer');

class AutoJobApply {
    constructor() {
        this.email = "sutariyahit7749@gmail.com";
        this.pin = "778899";
        this.candidateId = "a5903d60-4798-11f0-ad5c-53d600a1f3dc";
        this.csrf_token = "";
        this.aws_waf_token = "";
        this.session_token = "";
        this.auth_token = "";
        this.stop_process = false;
        this.jobSearchInterval = null;
        this.tokenRefreshInterval = null;
        this.errorCount = 0;
        this.maxErrorCount = 5;
        this.cooldownPeriod = 15 * 60 * 1000;
        this.isInCooldown = false;
        this.hasRestartedAfterCooldown = false;
        this.axiosInstance = axios.create({
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15'
            }
        });
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sutariyahit7749@gmail.com',
                pass: 'hldc nqby dhsi tych'
            }
        });
    }

    async sendEmail(subject, text) {
        try {
            // Add a timeout to prevent hanging indefinitely (e.g., 10s max)
            const emailPromise = this.transporter.sendMail({
                from: 'sutariyahit7749@gmail.com',
                to: 'sutariyahit7749@gmail.com',
                subject: `${subject} - ${DateTime.now().toISO()}`,
                text: text
            });

            // Fail fast if email takes too long (optional)
            await Promise.race([
                emailPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Email timeout')), 10_000)
                )
            ]);
        } catch (error) {
            console.error('Error sending email:', error);
            // Optional: Log to a monitoring service (e.g., Sentry)
        }
    }

    async get_csrf_token() {
        try {
            const url = 'https://auth.hiring.amazon.com/api/csrf?countryCode=CA';
            const headers = {
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json, text/plain, */*',
                'Sec-Fetch-Site': 'same-origin',
                'Accept-Language': 'en-GB,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Fetch-Mode': 'cors',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
                'Referer': 'https://auth.hiring.amazon.com/',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Priority': 'u=3, i',
            };
            const response = await axios.get(url, { headers });
            if (response.status === 200) {
                return response.data.token;
            } else {
                this.sendEmail('CSRF Token Error', `Status Code: ${response.status}\nData: ${response.data}`).catch(console.error);
                return false;
            }
        } catch (error) {
            this.sendEmail('CSRF Token Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    async sign_in_first_api(csrf_token) {
        try {
            const url = 'https://auth.hiring.amazon.com/api/candidate/v2?countryCode=CA';
            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json, text/plain, */*',
                'Sec-Fetch-Site': 'same-origin',
                'Accept-Language': 'en-GB,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Fetch-Mode': 'cors',
                'Origin': 'https://auth.hiring.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
                'Referer': 'https://auth.hiring.amazon.com/',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Priority': 'u=3, i',
            };
            const data = {
                "candidateLoginProp": this.email,
                "token": csrf_token,
                "countryName": "Canada"
            };
            const response = await axios.post(url, data, { headers });
            return response.status === 200;
        } catch (error) {
            this.sendEmail('Sign In First API Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    async sign_in_second_api(csrf_token) {
        try {
            const url = 'https://auth.hiring.amazon.com/api/authentication/verify-sign-in?countryCode=CA';
            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json, text/plain, */*',
                'Sec-Fetch-Site': 'same-origin',
                'Accept-Language': 'en-AU,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Fetch-Mode': 'cors',
                'Origin': 'https://auth.hiring.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
                'Referer': 'https://auth.hiring.amazon.com/',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Priority': 'u=3, i',
            };
            const data = {
                "user": this.email,
                "pin": this.pin,
                "token": csrf_token,
                "countryName": "Canada"
            };
            const response = await axios.post(url, data, { headers });
            return response.status === 200;
        } catch (error) {
            this.sendEmail('Sign In Second API Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    async sign_in(csrf_token, aws_waf_token) {
        try {
            const url = 'https://auth.hiring.amazon.com/api/authentication/sign-in?countryCode=US';
            const headers = {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Accept': 'application/json, text/plain, */*',
                'Sec-Fetch-Site': 'same-origin',
                'Accept-Language': 'en-AU,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Sec-Fetch-Mode': 'cors',
                'Origin': 'https://auth.hiring.amazon.com',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
                'Referer': 'https://auth.hiring.amazon.com/',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Cookie': `aws-waf-token=${aws_waf_token}`,
                'Priority': 'u=3, i',
            };
            const data = {
                "loginType": "email",
                "pin": this.pin,
                "user": this.email,
                "token": csrf_token,
                "locale": "en-CA",
                "countryName": "Canada"
            };
            const response = await axios.post(url, data, { headers });
            if (response.status === 200) {
                return response.data.session;
            }
            return false;
        } catch (error) {
            this.sendEmail('Sign In Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    async get_aws_waf_token() {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--disable-setuid-sandbox",
                    "--no-sandbox",
                    "--single-process",
                    "--no-zygote",
                    "--disable-blink-features=AutomationControlled",
                    "--start-maximized"
                ],
                executablePath:
                    process.env.NODE_ENV === "production"
                        ? process.env.PUPPETEER_EXECUTABLE_PATH
                        : puppeteer.executablePath(),
            });

            try {
                const page = await browser.newPage();
                await page.goto("https://auth.hiring.amazon.com/#/login", { waitUntil: 'networkidle2' });
                await new Promise(resolve => setTimeout(resolve, 5000));
                const cookies = await page.cookies();
                for (const cookie of cookies) {
                    if (cookie.name === 'aws-waf-token') {
                        return cookie.value;
                    }
                }
                return false;
            } finally {
                await browser.close();
            }
        } catch (error) {
            this.sendEmail('AWS WAF Token Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    async confirm_amazon_otp(otp, session, csrf_token, aws_waf_token) {
        try {
            const url = "https://auth.hiring.amazon.com/api/authentication/confirm-otp?countryCode=CA";
            const headers = {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Accept": "application/json, text/plain, */*",
                "Sec-Fetch-Site": "same-origin",
                "Accept-Language": "en-AU,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "Origin": "https://auth.hiring.amazon.com",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
                "Referer": "https://auth.hiring.amazon.com/",
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "empty",
                "CSRF-Token": csrf_token,
                'Cookie': `aws-waf-token=${aws_waf_token}`,
                "Priority": "u=3, i"
            };
            const payload = {
                "otp": otp,
                "session": session,
                "user": this.email,
                "token": csrf_token,
                "countryName": "Canada",
                "countryCode": "CA"
            };
            const response = await axios.post(url, payload, { headers });
            if (response.status === 200) {
                return response.data.signInUserSession.accessToken;
            }
            return false;
        } catch (error) {
            this.sendEmail('OTP Confirmation Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    async create_application(jobId, scheduleId, aws_waf_token, auth_token) {
        try {
            console.log(`jobId: ${jobId}, scheduleId: ${scheduleId}, aws_waf_token: ${aws_waf_token}, auth_token: ${auth_token}`)
            const url = "https://hiring.amazon.com/application/api/candidate-application/ds/create-application/";
            const headers = {
                "Content-Type": "application/json;charset=utf-8",
                "Accept": "application/json, text/plain, */*",
                "Authorization": auth_token,
                "Sec-Fetch-Site": "same-origin",
                "Accept-Language": "en-AU,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "Origin": "https://hiring.amazon.com",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
                "Referer": `https://hiring.amazon.com/application/us/?CS=true&jobId=${jobId}&locale=en-CA&scheduleId=${scheduleId}&ssoEnabled=1`,
                "Sec-Fetch-Dest": "empty",
                "Cookie": `aws-waf-token=${aws_waf_token}`,
                "bb-ui-version": "bb-ui-v2",
                "Priority": "u=3, i"
            };
            const payload = {
                "jobId": jobId,
                "dspEnabled": true,
                "scheduleId": scheduleId,
                "candidateId": this.candidateId,
                "activeApplicationCheckEnabled": true
            };
            const response = await axios.post(url, payload, { headers });
            console.log(`Function: create_application,  jobId: ${jobId}, response_status: ${response.status}, response: ${JSON.stringify(response.data, null, 2)}`)
            if (response.status === 200) {
                await this.sendEmail('Job Application Success', `Successfully applied for job ${jobId}`);
                return true;
            } else {
                throw new Error(`Unexpected response: ${response.status} - ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            console.log(error.response)
            if (error.response) {
                // API returned 4xx/5xx (HTTP error)
                console.error("API Error:", {
                    status: error.response.status,
                    data: error.response.data,  // This often contains the reason for 400
                    headers: error.response.headers,
                });
            } else if (error.request) {
                // Request was made but no response (network error)
                console.error("Network Error:", error.message);
            } else {
                // Code-level error (e.g., undefined variable)
                console.error("Runtime Error:", error.message);
            }

            this.sendEmail('Job Application Failed', JSON.stringify(error.response?.data || error.message));
            this.stop_process = true;
            return false;
        }
    }

    async get_otp() {
        try {
            const response = await axios.get("http://localhost:3000/emails");
            if (response.status === 200) {
                return response.data.otp;
            }
            return false;
        } catch (error) {
            this.sendEmail('OTP Retrieval Error', error.message).catch(console.error);
            this.stop_process = true;
            return false;
        }
    }

    get_canada_current_date() {
        return DateTime.now().setZone('America/Toronto').toISODate();
    }

    async search_amazon_jobs(bearer_token) {
        try {
            const current_date_in_canada = this.get_canada_current_date();
            const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
            const headers = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Authorization": `Bearer Status|logged-in|Session|${bearer_token}`,
                "Sec-Fetch-Site": "cross-site",
                "Accept-Language": "en-AU,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "Origin": "https://hiring.amazon.ca",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
                "Referer": "https://hiring.amazon.ca/",
                "Sec-Fetch-Dest": "empty",
                "Priority": "u=3, i",
                "country": "Canada",
                "iscanary": "false"
            };
            const payload = {
                "operationName": "searchJobCardsByLocation",
                "variables": {
                    "searchJobRequest": {
                        "locale": "en-CA",
                        "country": "Canada",
                        "keyWords": "",
                        "equalFilters": [
                            {
                                "key": "scheduleRequiredLanguage",
                                "val": "en-CA"
                            }
                        ],
                        "containFilters": [
                            {
                                "key": "isPrivateSchedule",
                                "val": ["false"]
                            }
                        ],
                        "rangeFilters": [
                            {
                                "key": "hoursPerWeek",
                                "range": {
                                    "minimum": 0,
                                    "maximum": 80
                                }
                            }
                        ],
                        "orFilters": [],
                        "dateFilters": [
                            {
                                "key": "firstDayOnSite",
                                "range": {
                                    "startDate": current_date_in_canada
                                }
                            }
                        ],
                        "sorters": [
                            {
                                "fieldName": "totalPayRateMax",
                                "ascending": "false"
                            }
                        ],
                        "pageSize": 100,
                        "consolidateSchedule": true
                    }
                },
                "query": `query searchJobCardsByLocation($searchJobRequest: SearchJobRequest!) {
                    searchJobCardsByLocation(searchJobRequest: $searchJobRequest) {
                        nextToken
                        jobCards {
                            jobId
                            jobTitle
                            jobType
                            employmentType
                            city
                            postalCode
                            locationName
                            totalPayRateMin
                            totalPayRateMax
                            bonusPay
                            scheduleCount
                            __typename
                        }
                        __typename
                    }
                }`
            };
            const response = await axios.post(url, payload, { headers });
            if (response.status === 200 && response.data?.data?.searchJobCardsByLocation?.jobCards?.length > 0) {
                console.log(`Total ${response.data?.data?.searchJobCardsByLocation?.jobCards?.length} Jobs Found.`)
                return response.data.data.searchJobCardsByLocation.jobCards;
            }
            return [];
        } catch (error) {
            this.sendEmail('Job Search Error', error.message).catch(console.error);
            return [];
        }
    }

    async search_schedule_cards(bearer_token, job_id) {
        try {
            const current_date_in_canada = this.get_canada_current_date();
            const url = "https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql";
            const headers = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Authorization": `Bearer ${bearer_token}`,
                "Sec-Fetch-Site": "cross-site",
                "Accept-Language": "en-AU,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "Origin": "https://hiring.amazon.ca",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
                "Referer": "https://hiring.amazon.ca/",
                "Sec-Fetch-Dest": "empty",
                "Priority": "u=3, i",
                "country": "Canada",
                "iscanary": "false"
            };
            const payload = {
                "operationName": "searchScheduleCards",
                "variables": {
                    "searchScheduleRequest": {
                        "locale": "en-CA",
                        "country": "Canada",
                        "keyWords": "",
                        "equalFilters": [],
                        "containFilters": [
                            {
                                "key": "isPrivateSchedule",
                                "val": ["false"]
                            }
                        ],
                        "rangeFilters": [
                            {
                                "key": "hoursPerWeek",
                                "range": {
                                    "minimum": 0,
                                    "maximum": 80
                                }
                            }
                        ],
                        "orFilters": [],
                        "dateFilters": [
                            {
                                "key": "firstDayOnSite",
                                "range": {
                                    "startDate": current_date_in_canada
                                }
                            }
                        ],
                        "sorters": [
                            {
                                "fieldName": "totalPayRateMax",
                                "ascending": "false"
                            }
                        ],
                        "pageSize": 1000,
                        "jobId": job_id,
                        "consolidateSchedule": true
                    }
                },
                "query": `query searchScheduleCards($searchScheduleRequest: SearchScheduleRequest!) {
                    searchScheduleCards(searchScheduleRequest: $searchScheduleRequest) {
                        nextToken
                        scheduleCards {
                            scheduleId
                            firstDayOnSite
                            scheduleText
                            __typename
                        }
                        __typename
                    }
                }`
            };
            const response = await axios.post(url, payload, { headers });
            console.log(`Function: search_schedule_cards,  Job Id: ${job_id}, response_status: ${response.status}, response: ${JSON.stringify(response.data, null, 2)}`)
            if (response.status === 200 && response.data?.data?.searchScheduleCards?.scheduleCards?.length > 0) {
                console.log(`Total ${response.data?.data?.searchScheduleCards?.scheduleCards?.length} Schedule Cards Found`)
                return response.data.data.searchScheduleCards.scheduleCards;
            }
            return [];
        } catch (error) {
            this.sendEmail('Schedule Search Error', error.message).catch(console.error);
            return [];
        }
    }

    async refreshTokens() {
        try {
            console.log("Refreshing tokens...");
            const { csrf_token, aws_waf_token, session_token, auth_token } = await this.main();
            if (csrf_token && aws_waf_token && session_token && auth_token) {
                this.csrf_token = csrf_token;
                this.aws_waf_token = aws_waf_token;
                this.session_token = session_token;
                this.auth_token = auth_token;
                this.sendEmail('Tokens Refreshed', 'Tokens were successfully refreshed').catch(console.error);
                return true;
            }
            return false;
        } catch (error) {
            this.sendEmail('Token Refresh Error', error.message).catch(console.error);
            return false;
        }
    }

    async startTokenRefresh() {
        try {
            await this.refreshTokens();
            this.tokenRefreshInterval = setInterval(async () => {
                if (this.stop_process) {
                    clearInterval(this.tokenRefreshInterval);
                    return;
                }
                await this.refreshTokens();
            }, 7100000);
        } catch (error) {
            this.sendEmail('Token Refresh Start Error', error.message).catch(console.error);
            this.stopProcess();
        }
    }

    async handleCooldown() {
        this.isInCooldown = true;
        this.stopProcess();
        this.sendEmail('Process Paused', 'Process paused for 15 minutes due to errors').catch(console.error);

        setTimeout(async () => {
            this.isInCooldown = false;
            this.hasRestartedAfterCooldown = true;
            this.errorCount = 0;
            this.sendEmail('Process Restarted', 'Process restarted after 15 minute cooldown').catch(console.error);
            this.startTokenRefresh();
            this.find_jobs_every_300ms();
        }, this.cooldownPeriod);
    }

    async find_jobs_every_300ms() {
        try {
            const executeSearch = async () => {
                try {
                    if (this.stop_process) return;

                    if (this.isInCooldown) return;

                    if (!this.csrf_token) return;

                    const jobs = await this.search_amazon_jobs(this.csrf_token);
                    if (jobs.length === 0) {
                        this.errorCount = 0;
                        return;
                    }

                    const jobDetails = jobs.map(job => ({
                        jobId: job.jobId,
                        jobTitle: job.jobTitle,
                        jobType: job.jobType,
                        employmentType: job.employmentType,
                        city: job.city,
                        postalCode: job.postalCode,
                        locationName: job.locationName,
                        totalPayRateMin: job.totalPayRateMin,
                        totalPayRateMax: job.totalPayRateMax,
                        bonusPay: job.bonusPay,
                        scheduleCount: job.scheduleCount
                    }));
                    console.log(`Job Details: ${JSON.stringify(jobDetails, null, 2)}`)
                    this.sendEmail('Jobs Found', JSON.stringify(jobDetails, null, 2)).catch(console.error);

                    for (const job of jobs) {
                        if (this.stop_process) break;

                        const schedule_response = await this.search_schedule_cards(this.csrf_token, job.jobId);
                        console.log(`Schedule response length: ${schedule_response.length}`)
                        if (schedule_response.length > 0) {
                            const latestSchedule = schedule_response[0];
                            if (job.jobId && latestSchedule.scheduleId) {
                                const applicationSuccess = await this.create_application(
                                    job.jobId,
                                    latestSchedule.scheduleId,
                                    this.aws_waf_token,
                                    this.auth_token
                                );

                                if (applicationSuccess) {
                                    this.stopProcess();
                                    return;
                                }
                            }
                        }
                    }

                    this.errorCount = 0;
                } catch (error) {
                    this.errorCount++;
                    this.sendEmail('Job Search Attempt Error', `Attempt ${this.errorCount}: ${error.message}`).catch(console.error);

                    if (this.errorCount >= this.maxErrorCount) {
                        if (!this.hasRestartedAfterCooldown) {
                            await this.handleCooldown();
                        } else {
                            this.sendEmail('Process Stopped', 'Process stopped permanently due to repeated errors').catch(console.error);
                            this.stopProcess();
                        }
                    }
                }
            };

            // Run immediately and then every 10 seconds
            await executeSearch();
            this.jobSearchInterval = setInterval(executeSearch, 100);

        } catch (error) {
            this.sendEmail('Fatal Job Search Error', error.message).catch(console.error);
            this.stopProcess();
        }
    }

    // async find_jobs_every_300ms() {
    //     try {
    //         let lastExecutionTime = 0;

    //         const executeSearch = async () => {
    //             try {
    //                 if (this.isInCooldown) return;

    //                 const startTime = Date.now();
    //                 const timeSinceLastCall = startTime - lastExecutionTime;
    //                 const delayNeeded = Math.max(0, 300 - timeSinceLastCall);

    //                 if (delayNeeded > 0) {
    //                     await new Promise(resolve => setTimeout(resolve, delayNeeded));
    //                 }

    //                 if (!this.csrf_token) return;

    //                 const jobs = await this.search_amazon_jobs(this.csrf_token);
    //                 if (jobs.length === 0) {
    //                     this.errorCount = 0;
    //                     return;
    //                 }

    //                 const jobDetails = jobs.map(job => ({
    //                     jobId: job.jobId,
    //                     jobTitle: job.jobTitle,
    //                     jobType: job.jobType,
    //                     employmentType: job.employmentType,
    //                     city: job.city,
    //                     postalCode: job.postalCode,
    //                     locationName: job.locationName,
    //                     totalPayRateMin: job.totalPayRateMin,
    //                     totalPayRateMax: job.totalPayRateMax,
    //                     bonusPay: job.bonusPay,
    //                     scheduleCount: job.scheduleCount
    //                 }));
    //                 console.log(`Job Details: ${JSON.stringify(jobDetails, null, 2)}`)
    //                 this.sendEmail('Jobs Found', JSON.stringify(jobDetails, null, 2)).catch(console.error).catch(console.error);

    //                 for (const job of jobs) {
    //                     if (this.stop_process) break;

    //                     const schedule_response = await this.search_schedule_cards(this.csrf_token, job.jobId);
    //                     console.log(`Schedele response length: ${schedule_response.length}`)
    //                     if (schedule_response.length > 0) {
    //                         const latestSchedule = schedule_response[0];
    //                         if (job.jobId && latestSchedule.scheduleId) {
    //                             const applicationSuccess = await this.create_application(
    //                                 job.jobId,
    //                                 latestSchedule.scheduleId,
    //                                 this.aws_waf_token,
    //                                 this.auth_token
    //                             );

    //                             if (applicationSuccess) {
    //                                 this.stopProcess();
    //                                 return;
    //                             }
    //                         }
    //                     }
    //                 }

    //                 this.errorCount = 0;
    //             } catch (error) {
    //                 this.errorCount++;
    //                 this.sendEmail('Job Search Attempt Error', `Attempt ${this.errorCount}: ${error.message}`).catch(console.error);

    //                 if (this.errorCount >= this.maxErrorCount) {
    //                     if (!this.hasRestartedAfterCooldown) {
    //                         await this.handleCooldown();
    //                     } else {
    //                         this.sendEmail('Process Stopped', 'Process stopped permanently due to repeated errors').catch(console.error);
    //                         this.stopProcess();
    //                     }
    //                 }
    //             } finally {
    //                 lastExecutionTime = Date.now();
    //             }
    //         };

    //         this.jobSearchInterval = setInterval(executeSearch, 300);
    //         await executeSearch();
    //         await new Promise(() => { });
    //     } catch (error) {
    //         this.sendEmail('Fatal Job Search Error', error.message).catch(console.error);
    //         this.stopProcess();
    //     }
    // }


    stopProcess() {
        this.stop_process = true;
        if (this.jobSearchInterval) clearInterval(this.jobSearchInterval);
        if (this.tokenRefreshInterval) clearInterval(this.tokenRefreshInterval);
    }

    async main() {
        try {
            const aws_waf_token = await this.get_aws_waf_token();
            const csrf_token = await this.get_csrf_token();

            if (csrf_token && aws_waf_token) {
                console.log("csrf_token and aws_waf_token successfully found")
                const first_step_verification = await this.sign_in_first_api(csrf_token);
                if (first_step_verification) {
                    console.log("First step of verification successfully complete")
                    const second_step_verification = await this.sign_in_second_api(csrf_token);
                    if (second_step_verification) {
                        console.log("Second step of verification successfully complete")
                        const session_token = await this.sign_in(csrf_token, aws_waf_token);
                        if (session_token) {
                            console.log("Session token successfully retrived")
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            const otp = await this.get_otp();
                            if (otp) {
                                console.log("OTP token successfully retrived")
                                const auth_token = await this.confirm_amazon_otp(otp, session_token, csrf_token, aws_waf_token);
                                if (auth_token) {
                                    console.log("Auth token successfully retrived")
                                    return { csrf_token, aws_waf_token, session_token, auth_token };
                                } else {
                                    console.log("Auth token successfully not retrived")
                                    console.log(`csrf_token: ${csrf_token}, aws_waf_token: ${aws_waf_token}, session_token: ${session_token}, auth_token: ${auth_token}`)
                                    return {
                                        csrf_token: null, aws_waf_token: null, session_token: null, auth_token: null
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            this.sendEmail('Main Process Error', error.message).catch(console.error);
        }
        return { csrf_token: null, aws_waf_token: null, session_token: null, auth_token: null };
    }
}

const app = express();
const PORT = 3000;

const config = {
    imap: {
        user: "sutariyahit7749@gmail.com",
        password: "hldc nqby dhsi tych",
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000
    }
};

function extractOtp(text) {
    const match = text.match(/\b(\d{6})\b/);
    return match ? match[1] : null;
}

async function fetchLatestOtp(fromEmail) {
    let connection;
    try {
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        const searchCriteria = ['UNSEEN', ['FROM', fromEmail]];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false
        };
        const messages = await connection.search(searchCriteria, fetchOptions);
        if (!messages || messages.length === 0) {
            return { error: "No unread emails found from the specified sender." };
        }
        const latestMessage = messages[messages.length - 1];
        const parsed = await simpleParser(latestMessage.parts.filter(part => part.which === 'TEXT')[0].body);
        const otp = extractOtp(parsed.text || parsed.html || '');
        if (otp) {
            return {
                otp,
                subject: parsed.subject || "",
                date: parsed.date || ""
            };
        } else {
            return { error: "OTP not found in the email." };
        }
    } catch (err) {
        return { error: err.message };
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

app.get("/emails", async (req, res) => {
    const fromEmail = "no-reply@jobs.amazon.com";
    if (!config.imap.user || !config.imap.password) {
        return res.status(400).json({ error: "Missing email credentials" });
    }
    const result = await fetchLatestOtp(fromEmail);
    res.json(result);
});

const obj = new AutoJobApply();

process.on('SIGINT', () => {
    obj.stopProcess();
    process.exit();
});

process.on('SIGTERM', () => {
    obj.stopProcess();
    process.exit();
});

(async () => {
    try {
        await obj.startTokenRefresh();
        await obj.find_jobs_every_300ms();
    } catch (error) {
        await obj.sendEmail('Initialization Error', error.message).catch(console.error);
        obj.stopProcess();
    }
})();

app.listen(PORT, () => {
    console.log(`OTP server running on port ${PORT}`);
});