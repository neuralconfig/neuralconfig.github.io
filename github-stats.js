// GitHub Stats Integration for neuralconfig projects
// Fetches repository statistics from GitHub API and displays them

const GITHUB_ORG = 'neuralconfig';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Repositories to track
const REPOS = [
    'osticket-agent',
    'ruckus-ztp',
    'openrouter-chat-app',
    'survival-rag',
    'r1-api',
    'sz-acl',
    'pflogs',
    'wifi-test',
    'wispr-portal',
    'ap-reboot-manager'
];

// Cache management
function getCachedStats() {
    try {
        const cached = localStorage.getItem('github_stats_cache');
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem('github_stats_cache');
            return null;
        }
        return data;
    } catch (e) {
        return null;
    }
}

function setCachedStats(data) {
    try {
        localStorage.setItem('github_stats_cache', JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        // Silently fail cache operations
    }
}

// Fetch repository stats from GitHub API
async function fetchRepoStats(repoName) {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_ORG}/${repoName}`);
        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }
        const data = await response.json();
        return {
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            watchers: data.watchers_count || 0,
            openIssues: data.open_issues_count || 0,
            lastUpdated: data.pushed_at,
            language: data.language,
            description: data.description
        };
    } catch (error) {
        return null;
    }
}

// Fetch all repository stats
async function fetchAllStats() {
    // Check cache first
    const cached = getCachedStats();
    if (cached) {
        return cached;
    }

    // Fetch fresh data
    const results = {};
    const promises = REPOS.map(async (repo) => {
        const stats = await fetchRepoStats(repo);
        if (stats) {
            results[repo] = stats;
        }
    });

    await Promise.all(promises);

    // Cache the results
    setCachedStats(results);

    return results;
}

// Format date as "X days/months ago"
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Create stats badges HTML
function createStatsBadges(stats) {
    if (!stats) return '';

    const badges = [];

    // Stars badge
    if (stats.stars > 0) {
        badges.push(`
            <span class="stat-badge stars" title="${stats.stars} stars">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                </svg>
                ${stats.stars}
            </span>
        `);
    }

    // Forks badge
    if (stats.forks > 0) {
        badges.push(`
            <span class="stat-badge forks" title="${stats.forks} forks">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                </svg>
                ${stats.forks}
            </span>
        `);
    }

    // Last updated badge
    if (stats.lastUpdated) {
        badges.push(`
            <span class="stat-badge updated" title="Last updated ${new Date(stats.lastUpdated).toLocaleDateString()}">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.75.75 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0z"/>
                </svg>
                ${formatRelativeTime(stats.lastUpdated)}
            </span>
        `);
    }

    return badges.join('');
}

// Add stats to project cards
function addStatsToProjects(statsData) {
    // Find all project cards
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        // Get project name from the h3 element
        const h3 = card.querySelector('.project-header h3');
        if (!h3) return;

        const repoName = h3.textContent.trim();
        const stats = statsData[repoName];

        if (!stats) return;

        // Check if stats already exist
        if (card.querySelector('.github-stats')) return;

        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'github-stats';
        statsContainer.innerHTML = createStatsBadges(stats);

        // Insert after project description or tech section
        const description = card.querySelector('.project-description');
        const techSection = card.querySelector('.project-tech');

        if (description && techSection) {
            // Insert between description and tech section
            description.parentNode.insertBefore(statsContainer, techSection);
        } else if (description) {
            // Insert after description
            description.parentNode.insertBefore(statsContainer, description.nextSibling);
        } else {
            // Insert at the beginning of the card
            card.insertBefore(statsContainer, card.firstChild);
        }
    });
}

// Initialize GitHub stats
async function initGitHubStats() {
    try {
        const statsData = await fetchAllStats();
        addStatsToProjects(statsData);
    } catch (error) {
        // Silently fail initialization
    }
}

// Lazy loading: only fetch stats when project cards are in viewport
function setupLazyLoading() {
    const projectCards = document.querySelectorAll('.project-card');

    if ('IntersectionObserver' in window) {
        // Use Intersection Observer for efficient lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Load stats when any project card becomes visible
                    if (!statsLoaded) {
                        statsLoaded = true;
                        initGitHubStats();
                        observer.disconnect(); // Stop observing after loading
                    }
                }
            });
        }, {
            rootMargin: '50px' // Start loading slightly before cards are visible
        });

        // Observe first few project cards
        projectCards.forEach((card, index) => {
            if (index < 3) observer.observe(card);
        });
    } else {
        // Fallback: load after a delay
        setTimeout(initGitHubStats, 1000);
    }
}

let statsLoaded = false;

// Run lazy loading setup on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLazyLoading);
} else {
    setupLazyLoading();
}

// Export for manual refresh if needed
window.refreshGitHubStats = async function() {
    localStorage.removeItem('github_stats_cache');
    statsLoaded = false;
    await initGitHubStats();
};
