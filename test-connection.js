const neo4j = require('neo4j-driver');

async function testConnection() {
  console.log('Starting connection test...');
  
  const driver = neo4j.driver(
    'bolt://127.0.0.1:7687',  // Using explicit IP address
    neo4j.auth.basic('neo4j', 'ssss8888'),
    {
      encrypted: false,
      trust: 'TRUST_ALL_CERTIFICATES',
      maxConnectionLifetime: 3 * 60 * 60 * 1000,
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 2 * 60 * 1000,
      disableLosslessIntegers: true,
      logging: {
        level: 'debug',
        logger: (level, message) => {
          console.log(`Neo4j ${level}: ${message}`);
        }
      }
    }
  );

  console.log('Driver created with settings:', {
    uri: 'bolt://127.0.0.1:7687',
    encrypted: false,
    trust: 'TRUST_ALL_CERTIFICATES'
  });

  const session = driver.session();
  try {
    console.log('Session created, testing connection...');
    
    // Test basic connectivity
    console.log('Running test query...');
    const result = await session.run('RETURN 1 as n');
    console.log('Basic connection test successful:', result.records[0].get('n'));

    // Test database info
    console.log('Getting database info...');
    const dbInfo = await session.run('CALL dbms.components() YIELD name, versions, edition RETURN *');
    console.log('Database info:', dbInfo.records[0].toObject());

    console.log('Connection test completed successfully!');
  } catch (error) {
    console.error('Connection test failed with error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    if (error.code === 'ServiceUnavailable') {
      console.error('Please check if:');
      console.error('1. Neo4j server is running');
      console.error('2. Port 7687 is accessible');
      console.error('3. Server configuration matches:');
      console.error('   - server.bolt.enabled=true');
      console.error('   - server.bolt.tls_level=DISABLED');
      console.error('   - server.bolt.listen_address=:7687');
    }
  } finally {
    console.log('Closing session...');
    await session.close();
    console.log('Closing driver...');
    await driver.close();
    console.log('Cleanup completed.');
  }
}

// Add error handling for the main function
testConnection().catch(error => {
  console.error('Unhandled error in test connection:', error);
  process.exit(1);
}); 