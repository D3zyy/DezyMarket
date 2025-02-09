"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Post from '../search/Post';

const PostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Určujeme, jestli jsou ještě další příspěvky
    const loaderRef = useRef(null);
    const searchParams = useSearchParams();

    const fetchPosts = async (page, filters) => {
        setLoading(true);
        const res = await fetch('/api/getPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...filters,
                page,
            }),
        });
        const data = await res.json();

        // Pokud server nevrátí žádné příspěvky, znamená to, že už není co načítat
        if (data.posts.length === 0) {
            setHasMore(false);
        }

        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setLoading(false);
    };

    useEffect(() => {
        // Získání filtrů z URL pomocí useSearchParams
        const keyWord = searchParams.get('keyWord') || '';
        const category = searchParams.get('category') || '';
        const section = searchParams.get('section') || '';
        const price = searchParams.get('price') || '';
        const location = searchParams.get('location') || '';

        // Filtry pro hledání příspěvků
        const filters = {
            keyWord,
            category,
            section,
            price,
            location,
        };

        // Resetujeme příspěvky a stránku, pokud se změní filtry
        setPosts([]);
        setPage(1);  // Resetování stránky na 1
        setHasMore(true);  // Povolíme načítání

        fetchPosts(1, filters);  // Načítání příspěvků s novými filtry
    }, [searchParams]); // Při změně parametrů se znovu načtou příspěvky

    const handleLoadMore = (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(handleLoadMore, {
            rootMargin: '100px', // Když se blížíme k dolnímu okraji stránky
        });
        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [loading, hasMore]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {/* Zobrazí skeletony, dokud se načítají příspěvky */}
            {loading ? (
                Array.from({ length: 9 }).map((_, index) => (
                    <div  key={index} className="flex  w-full flex-col gap-4">
  <div className="skeleton h-32 w-full"></div>
  <div className="skeleton h-4 w-28"></div>  <div className="skeleton h-4 w-28"></div>

</div>
                ))
            ) : posts.length > 0 ? (
                // Zobrazí skutečné příspěvky, pokud byly načteny
                posts.map((post) => (
                    <Post key={post.id} postDetails={post} section={post.section} />
                ))
            ) : (
               
                <div className="flex gap-2 items-center justify-center w-full col-span-full text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
                </svg>
                Žádné příspěvky nebyly nalezeny
            </div>
            )}

            {/* Loader */}
            <div ref={loaderRef} className="loading-indicator">
                {loading && <div>Načítám...</div>}
            </div>

            {/* Pokud nejsou žádné další příspěvky, zobraz informaci */}
            {!hasMore && !loading && posts.length > 0&& (
                <div className="no-more-posts">Žádné další příspěvky</div>
            )}
        </div>
    );
};

export default PostsPage;