import neo4j from 'neo4j-driver';
import { neo4jConfig } from '../config/neo4j.config';

class Neo4jService {
  constructor() {
    console.log('Initializing Neo4j connection with config:', {
      uri: neo4jConfig.uri,
      user: neo4jConfig.user,
      database: neo4jConfig.database
    });

    try {
      // First verify if the URI is valid
      if (!neo4jConfig.uri.startsWith('bolt://') && !neo4jConfig.uri.startsWith('neo4j://')) {
        throw new Error(`Invalid Neo4j URI: ${neo4jConfig.uri}. Must start with 'bolt://' or 'neo4j://'`);
      }

      // Create the driver with encryption settings matching server configuration
      this.driver = neo4j.driver(
        neo4jConfig.uri,
        neo4j.auth.basic(neo4jConfig.user, neo4jConfig.password),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000,
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 2 * 60 * 1000,
          disableLosslessIntegers: true,
          encrypted: false, // Match server.bolt.tls_level=DISABLED
          trust: 'TRUST_ALL_CERTIFICATES',
          logging: {
            level: 'debug',
            logger: (level, message) => {
              console.log(`Neo4j ${level}: ${message}`);
            }
          }
        }
      );

      // Verify the driver was created successfully
      if (!this.driver) {
        throw new Error('Failed to create Neo4j driver instance');
      }

      console.log('Neo4j driver initialized successfully with settings:', {
        uri: neo4jConfig.uri,
        encrypted: false,
        trust: 'TRUST_ALL_CERTIFICATES'
      });
    } catch (error) {
      console.error('Failed to initialize Neo4j driver:', error);
      throw new Error(`Neo4j initialization failed: ${error.message}`);
    }
  }

  async verifyConnection() {
    const session = await this.getSession();
    try {
      console.log('Verifying Neo4j connection...');
      console.log('Connection settings:', {
        uri: neo4jConfig.uri,
        encrypted: false,
        trust: 'TRUST_ALL_CERTIFICATES'
      });
      
      // Try a simple query first
      const result = await session.run('RETURN 1 as n');
      console.log('Basic connection test successful');

      // Try to get server info
      const serverInfo = await this.driver.verifyConnectivity();
      console.log('Server info:', serverInfo);

      // Try to get database info
      const dbInfo = await session.run('CALL dbms.components() YIELD name, versions, edition RETURN *');
      console.log('Database info:', dbInfo.records[0]?.toObject());

      return true;
    } catch (error) {
      console.error('Connection verification failed:', error);
      if (error.code === 'ServiceUnavailable') {
        throw new Error('Neo4j service is not available. Please check if the database is running and port 7687 is accessible.');
      } else if (error.code === 'SecurityError') {
        throw new Error('Authentication failed. Please check your credentials.');
      } else {
        throw new Error(`Connection verification failed: ${error.message}`);
      }
    } finally {
      await session.close();
    }
  }

  async getSession() {
    try {
      const session = this.driver.session({
        database: neo4jConfig.database,
        defaultAccessMode: neo4j.session.READ
      });
      return session;
    } catch (error) {
      console.error('Failed to create Neo4j session:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.driver.close();
      console.log('Neo4j connection closed successfully');
    } catch (error) {
      console.error('Error closing Neo4j connection:', error);
    }
  }

  // Get all papers with their properties
  async getAllPapers() {
    const session = await this.getSession();
    try {
      console.log('Fetching all papers...');
      
      // First, let's check what labels exist in the database
      const labelsResult = await session.run(
        `CALL db.labels() YIELD label
         RETURN collect(label) as labels`
      );
      const labels = labelsResult.records[0]?.get('labels');
      console.log('Available labels:', labels);

      // Then try to get all nodes with their properties
      const result = await session.run(
        `MATCH (n)
         RETURN n, labels(n) as labels`
      );
      
      console.log('Raw Neo4j Query Result:', JSON.stringify(result, null, 2));
      
      const papers = result.records.map(record => {
        const node = record.get('n');
        const properties = node.properties;
        const labels = record.get('labels');
        console.log('Raw Node Data:', {
          identity: node.identity.toString(),
          properties: properties,
          labels: labels
        });
        return {
          id: node.identity.toString(),
          ...properties,
          labels
        };
      });
      console.log('Final Papers Array:', JSON.stringify(papers, null, 2));
      return papers;
    } catch (error) {
      console.error('Error fetching papers:', error);
      throw new Error(`Failed to fetch papers: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  // Get paper details
  async getPaperDetails(paperId) {
    const session = await this.getSession();
    try {
      console.log('Fetching paper details for:', paperId);
      const result = await session.run(
        `MATCH (n)
         WHERE id(n) = $paperId
         RETURN n`,
        { paperId: neo4j.int(paperId) }
      );
      const paper = result.records[0]?.get('n');
      if (paper) {
        return {
          id: paper.identity.toString(),
          ...paper.properties
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching paper details:', error);
      throw new Error(`Failed to fetch paper details: ${error.message}`);
    } finally {
      await session.close();
    }
  }

  // Get related papers
  async getRelatedPapers(paperId) {
    const session = await this.getSession();
    try {
      console.log('Fetching related papers for:', paperId);
      const result = await session.run(
        `MATCH (n)-[r]-(related)
         WHERE id(n) = $paperId
         RETURN related
         LIMIT 10`,
        { paperId: neo4j.int(paperId) }
      );
      return result.records.map(record => {
        const node = record.get('related');
        return {
          id: node.identity.toString(),
          ...node.properties
        };
      });
    } catch (error) {
      console.error('Error fetching related papers:', error);
      throw new Error(`Failed to fetch related papers: ${error.message}`);
    } finally {
      await session.close();
    }
  }
}

export const neo4jService = new Neo4jService(); 