const API = process.env.CC_API || 'https://careercafe-backend-1.onrender.com';
const ADMIN_EMAIL = process.env.CC_ADMIN_EMAIL || 'admin@careercafe.co.ke';
const ADMIN_PASSWORD = process.env.CC_ADMIN_PASSWORD;
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD || 'dye30eyym';
const CLOUDINARY_PRESET = process.env.CLOUDINARY_PRESET || 'careercafe_gallery';
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'careerCafe/article';

if (!ADMIN_PASSWORD) {
    console.error('Set CC_ADMIN_PASSWORD before running this migration.');
    process.exit(1);
}

const dataImagePattern = /data:image\/[a-zA-Z0-9.+-]+;base64,[^"')\s<>]+/g;

function optimizedCloudinaryUrl(url) {
    if (!url || !url.includes('/image/upload/')) return url;
    if (url.includes('/image/upload/f_auto,')) return url;
    return url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1200/');
}

async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, options);
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${body}`);
    }
    return response.json();
}

async function login() {
    const data = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    return data.token;
}

async function uploadDataImage(dataUri, article, index) {
    const form = new FormData();
    form.append('file', dataUri);
    form.append('upload_preset', CLOUDINARY_PRESET);
    form.append('folder', CLOUDINARY_FOLDER);
    form.append('public_id', `${article.slug || `article-${article.id}`}-inline-${index}-${Date.now()}`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
        method: 'POST',
        body: form
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Cloudinary upload failed for article ${article.id}: ${response.status} ${body}`);
    }
    const data = await response.json();
    return optimizedCloudinaryUrl(data.secure_url);
}

async function main() {
    const token = await login();
    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    const articles = await request('/api/articles/all', { headers: authHeaders });
    let changedArticles = 0;
    let uploadedImages = 0;

    for (const article of articles) {
        const matches = [...new Set((article.content || '').match(dataImagePattern) || [])];
        if (!matches.length) continue;

        let content = article.content;
        console.log(`Article ${article.id} (${article.slug}) has ${matches.length} embedded image(s).`);

        for (const [index, dataUri] of matches.entries()) {
            const imageUrl = await uploadDataImage(dataUri, article, index + 1);
            content = content.split(dataUri).join(imageUrl);
            uploadedImages += 1;
            console.log(`  uploaded inline image ${index + 1}: ${imageUrl}`);
        }

        await request(`/api/articles/${article.id}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                title: article.title,
                slug: article.slug,
                summary: article.summary,
                content,
                category: article.category,
                imageUrl: article.imageUrl,
                published: article.published
            })
        });
        changedArticles += 1;
        console.log(`  updated article ${article.id}`);
    }

    console.log(`Done. Updated ${changedArticles} article(s), uploaded ${uploadedImages} image(s).`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
