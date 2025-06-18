import { posts } from './blog-data.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedPostId = urlParams.get('id');
    const postData = posts.find(p => p.id === requestedPostId);

    if (postData) {
        renderPost(postData);
    } else {
        renderError();
    }
});

function renderPost(post) {
    document.title = post.title + ' - Qitchen';
    document.getElementById('post-banner-image').src = post.bannerImage;
    document.getElementById('post-date').textContent = post.date;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-author').textContent = 'Author: ' + post.author;

    const postBody = document.getElementById('post-body');
    postBody.innerHTML = '';

    post.content.forEach(sectionData => {
        const section = document.createElement('section');
        section.className = 'blog-post__section';

        const subtitle = document.createElement('h2');
        subtitle.className = 'blog-post__subtitle';
        subtitle.textContent = sectionData.subtitle;
        section.appendChild(subtitle);

        sectionData.paragraphs.forEach(paragraphText => {
            const paragraph = document.createElement('p');
            paragraph.textContent = paragraphText;
            section.appendChild(paragraph);
        });

        postBody.appendChild(section);
    });
}

function renderError() {
    document.getElementById('post-title').textContent = 'Post no encontrado...';
    document.getElementById('post-body').innerHTML = '<p>El artículo que estás buscando no existe o ha sido removido.</p>';
}