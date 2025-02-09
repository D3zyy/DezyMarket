"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Post from '../search/Post';

const PostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const searchParams = useSearchParams();

    const fetchPosts = async (page, filters) => {
        if (!hasMore || loading) return; // Pokud už nejsou další příspěvky, nedělej nic
        setLoading(true);

        try {
            const res = await fetch('/api/getPosts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...filters, page }),
            });

            const data = await res.json();

            if (data.posts.length === 0) {
                setHasMore(false);
            } else {
                setPosts((prevPosts) => [...prevPosts, ...data.posts]);
            }
        } catch (error) {
            console.error("Chyba při načítání příspěvků:", error);
        }

        setLoading(false);
    };

    useEffect(() => {
        const keyWord = searchParams.get('keyWord') || '';
        const category = searchParams.get('category') || '';
        const section = searchParams.get('section') || '';
        const price = searchParams.get('price') || '';
        const location = searchParams.get('location') || '';

        const filters = { keyWord, category, section, price, location };

        setPosts([]); // Resetujeme příspěvky při změně filtrů
        setPage(1);
        setHasMore(true);

        fetchPosts(1, filters); // Načteme první stránku
    }, [searchParams]);

    useEffect(() => {
        const keyWord = searchParams.get('keyWord') || '';
        const category = searchParams.get('category') || '';
        const section = searchParams.get('section') || '';
        const price = searchParams.get('price') || '';
        const location = searchParams.get('location') || '';

        const filters = { keyWord, category, section, price, location };

        if (page > 1) {
            fetchPosts(page, filters);
        }
    }, [page]);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loading && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        }, { rootMargin: '100px' });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loading, hasMore]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-5">
            {posts.length > 0
                ? posts.map((post) => <Post key={post.id} postDetails={post} section={post.section} />)
                : !loading && (
                    <div className="flex gap-2 items-center justify-center w-full col-span-full text-center text-gray-500 ">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
                        </svg>
                        Žádné příspěvky nebyly nalezeny
                    </div>
                )}

            {loading &&
                Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className="flex w-full flex-col gap-4">
                        <div className="skeleton h-32 w-full"></div>
                        <div className="skeleton h-4 w-28"></div>
                        <div className="skeleton h-4 w-28"></div>
                    </div>
                ))
            }

         

            <div ref={loaderRef} className="w-full h-10"></div>
        </div>
    );
};

export default PostsPage;