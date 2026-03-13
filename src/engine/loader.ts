import { CardPoolSchema, NodePoolsSchema } from './schema';
import { cardRegistry } from './registry/CardRegistry';
import { nodeRegistry } from './registry/NodeRegistry';

export async function loadGameAssets() {
    try {
        const [cardsRes, nodesRes] = await Promise.all([
            fetch('/data/cards.json'),
            fetch('/data/nodes.json')
        ]);

        if (!cardsRes.ok || !nodesRes.ok) {
            throw new Error('Failed to fetch game assets');
        }

        const cardsData = await cardsRes.json();
        const nodesData = await nodesRes.json();

        // Validation Layer
        const validatedCards = CardPoolSchema.parse(cardsData);
        const validatedNodes = NodePoolsSchema.parse(nodesData);

        // Registry Initialization
        cardRegistry.initialize(validatedCards);
        nodeRegistry.initialize(validatedNodes);

        console.log('Successfully loaded and validated game assets');
    } catch (error) {
        console.error('Asset Ingestion Error:', error);
        throw error; // Re-throw to be handled by the app initialization
    }
}
