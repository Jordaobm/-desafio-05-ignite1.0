/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetStaticProps } from 'next';
import { format } from 'date-fns';

import Link from 'next/link';
import { useState } from 'react';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
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

export default function Home({ postsPagination }: HomeProps) {
  const [data, setData] = useState<PostPagination>({
    ...postsPagination,
    results: postsPagination?.results?.map((e: any) => {
      const title = String(e?.data?.title[0]?.text || e?.data?.title) || '';
      const subtitle =
        String(e?.data?.subtitle[0]?.text || e?.data?.subtitle) || '';
      const author = String(e?.data?.author[0]?.text || e?.data?.author) || '';

      return {
        ...e,
        data: {
          title,
          subtitle,
          author,
        },
        first_publication_date: format(
          new Date(e?.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
      };
    }),
  });

  function handlePaginate() {
    fetch(data?.next_page).then(res => {
      res?.json().then(response => {
        setData(prev => ({
          next_page: response?.next_page,
          results: [
            ...prev?.results,
            ...response?.results?.map(e => {
              const title =
                String(e?.data?.title[0]?.text || e?.data?.title) || '';
              const subtitle =
                String(e?.data?.subtitle[0]?.text || e?.data?.subtitle) || '';
              const author =
                String(e?.data?.author[0]?.text || e?.data?.author) || '';

              return {
                ...e,
                data: {
                  title,
                  subtitle,
                  author,
                },
                first_publication_date: format(
                  new Date(e?.first_publication_date),
                  'dd MMM yyyy',
                  {
                    locale: ptBR,
                  }
                ),
              };
            }),
          ],
        }));
      });
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.posts}>
        {data?.results?.map(post => {
          return (
            <Link key={post?.uid} href={`post/${post?.uid}`}>
              <div className={styles.post}>
                <h1>{post?.data?.title}</h1>
                <p>{post?.data?.subtitle}</p>

                <footer>
                  <div>
                    <img src="./calendar.svg" alt="Data" />
                    <span> {post?.first_publication_date}</span>
                  </div>

                  <div>
                    <img src="./user.svg" alt="Autor" />
                    <span> {post?.data?.author}</span>
                  </div>
                </footer>
              </div>
            </Link>
          );
        })}
      </div>

      {data?.next_page && (
        <button
          className={styles.button}
          type="button"
          onClick={handlePaginate}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps = async ctx => {
  const prismic = getPrismicClient({});
  const page = await prismic.getByType('desafio', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: {
        next_page: page?.next_page,
        results: page?.results,
      },
    },
  };
};
