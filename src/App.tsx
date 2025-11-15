import { useState } from 'react';
import Header from './components/common/Header';
import PostList from './components/PostList';
import crawledPosts from './data/posts.json';
import type { Post } from './types';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const posts = crawledPosts as Post[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={setSearchQuery} />
      <PostList posts={posts} searchQuery={searchQuery} />
    </div>
  );
}

export default App;
