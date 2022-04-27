import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  useEffect(() => {
    const formattedDate = postsPagination.results.map(post => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'PP',
          {
            locale: ptBR,
          }
        ),
      };
    });
    setPosts(formattedDate);
  }, [postsPagination.results]);

  async function loadMorePosts(): Promise<void> {
    const response = await fetch(nextPage).then(data => data.json());
    const newPosts = response.results.map((result: Post) => {
      return {
        ...result,
        first_publication_date: format(
          new Date(result.first_publication_date),
          'PP',
          {
            locale: ptBR,
          }
        ),
      };
    });
    setNextPage(response.next_page);
    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <main className={commonStyles.container}>
        {posts.map((post: Post) => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>

              <p>{post.data.subtitle}</p>
              <div className={styles.info}>
                <div>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
        {nextPage !== null && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={loadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', {
    pageSize: 1,
  });
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };
  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30,
  };
};
