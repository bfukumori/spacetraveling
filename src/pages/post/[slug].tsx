import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();
  const formattedDate = format(new Date(post.first_publication_date), 'PP', {
    locale: ptBR,
  });

  const readTimeMemo = useMemo(
    () =>
      function calculateReadTime(): number {
        const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
          return [...acc, ...data.heading.split(' ')];
        }, []).length;

        const amountWordsOfbody = RichText.asText(
          post.data.content.reduce((acc, data) => {
            return [...acc, ...data.body];
          }, [])
        ).split(' ').length;

        const readTime = Math.ceil(
          (amountWordsOfHeading + amountWordsOfbody) / 200
        );

        return readTime;
      },
    [post.data.content]
  );
  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <img
        src={post.data.banner.url}
        alt="banner"
        className={styles.bannerImg}
      />
      <main className={`${commonStyles.container} ${styles.post}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <div>
            <FiCalendar />
            <time>{formattedDate}</time>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{readTimeMemo()} min</span>
          </div>
        </div>
        {post.data.content.map(postContent => (
          <article key={postContent.heading} className={styles.postContent}>
            <h2>{postContent.heading}</h2>
            {postContent.body.map((body, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <p key={index}>{body.text}</p>
            ))}
          </article>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID(
    'posts',
    `${context.params.slug}`,
    {}
  );

  return {
    props: {
      post: response,
    },
    revalidate: 30 * 60,
  };
};
