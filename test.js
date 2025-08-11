import axios from 'axios';

const endpoint = 'https://e5mquma77feepi2bdn4d6h3mpu.appsync-api.us-east-1.amazonaws.com/graphql';

const headers = {
  'accept': '*/*',
  'accept-language': 'en-IN,en;q=0.9',
  'authorization': 'Bearer Status|unauthenticated|Session|eyJhbGciOiJLTVMiLCJ0eXAiOiJKV1QifQ.eyJpYXQiOjE3NTEzODgxMjIsImV4cCI6MTc1MTM5MTcyMn0.AQICAHidzPmCkg52ERUUfDIMwcDZBDzd+C71CJf6w0t6dq2uqwH3bFiKhLk5CMZe1uDhgtcNAAAAtDCBsQYJKoZIhvcNAQcGoIGjMIGgAgEAMIGaBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDCGu6cs59lKx/YLpmwIBEIBtfTyGQNDmHqX4oqtuFEqGDRETd4IG/pirF5chVN6So21vDLLqrRl/8OgdJ1CBDWeWnj0XPpAYRoV0eF3KqTVnwotNTyjCMEcNJrVJ7pAkl+R9BLHblY3nRbQdvtfq3aUXxRu9z1o72v1L+PPx6g==',
  'content-type': 'application/json',
  'country': 'United States',
  'iscanary': 'false',
  'origin': 'https://hiring.amazon.com',
  'priority': 'u=1, i',
  'referer': 'https://hiring.amazon.com/',
  'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
};

const query = `
  query searchJobCardsByLocation($searchJobRequest: SearchJobRequest!) {
    searchJobCardsByLocation(searchJobRequest: $searchJobRequest) {
      nextToken
      jobCards {
        jobId
        jobTitle
        city
        state
        totalPayRateMin
        totalPayRateMax
        featuredJob
        bonusJob
      }
    }
  }
`;

const variables = {
  searchJobRequest: {
    locale: "en-US",
    country: "United States",
    pageSize: 50,
    orFilters: [
      { key: "bonusJob", val: ["true"] },
      { key: "featuredJob", val: ["true"] }
    ],
    excludeFilters: [],
    excludeRangeFilters: [],
    sorters: [
      {
        fieldName: "totalPayRateMax",
        ascending: false
      }
    ],
    containFilters: [
      {
        key: "isPrivateSchedule",
        val: ["false"]
      }
    ],
    dateFilters: [
      {
        key: "firstDayOnSite",
        range: {
          startDate: "2025-07-01"
        }
      }
    ],
    consolidateSchedule: true
  }
};

async function fetchJobs() {
  try {
    const response = await axios.post(endpoint, {
      query,
      variables,
      operationName: "searchJobCardsByLocation"
    }, { headers });

    const jobs = response.data.data.searchJobCardsByLocation?.jobCards || [];
    console.log(`[${new Date().toISOString()}] Found ${jobs.length} jobs`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
  }
}

// Run every 1 second
fetchJobs()
