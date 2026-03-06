const http = require('http');

const CONFIG = {
  baseUrl: 'http://localhost:4000',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYmQyMDFjYS0zYTAzLTQxYTUtYThiZi0wNmUzZTEwYTFkMTQiLCJlbWFpbCI6InRlc3QudXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJURVNURVIiLCJpYXQiOjE3NzI3MTM2NTYsImV4cCI6MTc3MjcxNzI1Nn0.Eet7f2KStbB0Vig7Vec1GR58YMJ2ufJH32sjZNlVUyw',
  projectId: 'cmmawqcee0000igtiwf6sff5x',
};

const cases = [
  {
    title: 'Verify user login with valid credentials',
    module: 'Authentication',
    priority: 'HIGH',
    severity: 'CRITICAL',
    type: 'FUNCTIONAL',
    status: 'APPROVED',
  },
  {
    title: 'Verify login fails with invalid password',
    module: 'Authentication',
    priority: 'HIGH',
    severity: 'MAJOR',
    type: 'FUNCTIONAL',
    status: 'APPROVED',
  },
  {
    title: 'Verify forgot password email is sent',
    module: 'Authentication',
    priority: 'MEDIUM',
    severity: 'MAJOR',
    type: 'FUNCTIONAL',
    status: 'APPROVED',
  },
  {
    title: 'Verify user registration with valid data',
    module: 'Authentication',
    priority: 'HIGH',
    severity: 'CRITICAL',
    type: 'FUNCTIONAL',
    status: 'APPROVED',
  },
  {
    title: 'Verify dashboard loads after login',
    module: 'Dashboard',
    priority: 'HIGH',
    severity: 'MAJOR',
    type: 'SMOKE',
    status: 'APPROVED',
  },
  {
    title: 'Verify test case creation with all fields',
    module: 'Test Cases',
    priority: 'HIGH',
    severity: 'CRITICAL',
    type: 'FUNCTIONAL',
    status: 'APPROVED',
  },
  {
    title: 'Verify test case edit updates correctly',
    module: 'Test Cases',
    priority: 'MEDIUM',
    severity: 'MAJOR',
    type: 'REGRESSION',
    status: 'APPROVED',
  },
  {
    title: 'Verify bug report creation from failed test',
    module: 'Bugs',
    priority: 'HIGH',
    severity: 'CRITICAL',
    type: 'FUNCTIONAL',
    status: 'DRAFT',
  },
  {
    title: 'Verify search filters test cases correctly',
    module: 'Test Cases',
    priority: 'LOW',
    severity: 'MINOR',
    type: 'FUNCTIONAL',
    status: 'DRAFT',
  },
];

function create(tc) {
  const body = JSON.stringify({
    ...tc,
    description: 'Auto-generated test case for ' + tc.module,
    steps: [
      {
        stepNumber: 1,
        action: 'Navigate to the relevant page',
        expectedResult: 'Page loads successfully',
      },
      {
        stepNumber: 2,
        action: 'Perform the main action',
        expectedResult: 'System responds as expected',
      },
      {
        stepNumber: 3,
        action: 'Verify the outcome',
        expectedResult: 'Result matches expected behavior',
      },
    ],
    tags: [tc.module.toLowerCase().replace(/ /g, '-'), tc.type.toLowerCase()],
    automationStatus: 'NOT_AUTOMATED',
  });

  return new Promise((resolve, reject) => {
    const url = new URL(
      CONFIG.baseUrl + '/api/projects/' + CONFIG.projectId + '/test-cases'
    );
    const options = {
      hostname: url.hostname,
      port: url.port || 4000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + CONFIG.token,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ Created:', tc.title);
        } else {
          console.log('❌ Failed (' + res.statusCode + '):', data);
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log(
    '🚀 Seeding',
    cases.length,
    'test cases into project',
    CONFIG.projectId
  );
  for (const tc of cases) {
    await create(tc);
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log('✅ Done!');
})();
