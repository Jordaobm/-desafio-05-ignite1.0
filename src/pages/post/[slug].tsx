import { useRouter } from 'next/router';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';
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

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const postData: any = post;

  const formattedPost = {
    data: {
      author: postData?.data?.author[0]?.text || postData?.data?.author,
      banner: { url: postData?.data?.banner?.url || '' },
      title: postData?.data?.title[0]?.text || postData?.data?.title,
      content: postData?.data?.content,
    },
    first_publication_date: format(
      new Date(postData?.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  const wordsReadPerMinute = 200;

  const minutesReduce = formattedPost?.data?.content?.reduce((acc, content) => {
    let contentWords = 0;

    if (content?.heading?.length === 1) {
      content?.heading?.forEach(heading => {
        contentWords += heading?.text?.split(' ')?.length;
      });
    } else {
      contentWords += content?.heading?.split(' ')?.length;
    }

    content?.body?.forEach(body => {
      contentWords += body?.text?.split(' ')?.length;
    });

    return acc + contentWords;
  }, 0);

  const minutes = Math.ceil(minutesReduce / wordsReadPerMinute);

  return (
    <div className={styles.container}>
      <div className={styles.containerImage}>
        <img src={formattedPost?.data?.banner?.url || '/banner'} alt="Banner" />
      </div>

      <div className={styles.content}>
        <header>
          <h1>{formattedPost?.data?.title}</h1>

          <div className={styles.authorInfo}>
            <div>
              <img src="/calendar.svg" alt="Data" />
              <span> {formattedPost?.first_publication_date}</span>
            </div>

            <div>
              <img src="/user.svg" alt="Autor" />
              <span> {formattedPost?.data?.author}</span>
            </div>

            <div>
              <img src="/clock.svg" alt="Autor" />
              <span> {minutes} min</span>
            </div>
          </div>
        </header>

        {!formattedPost?.data?.content
          ? 'Carregando...'
          : formattedPost?.data?.content?.map(content => {
              return (
                <section
                  key={
                    content?.heading?.length === 1
                      ? RichText?.asText(content?.heading)
                      : content?.heading
                  }
                >
                  <div
                    className={styles.title}
                    dangerouslySetInnerHTML={{
                      __html:
                        content?.heading?.length === 1
                          ? RichText?.asText(content?.heading)
                          : content?.heading,
                    }}
                  />

                  <p
                    className={styles.body}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content?.body),
                    }}
                  />
                </section>
              );
            })}
      </div>
    </div>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const page = await prismic.getByType('desafio', {
    pageSize: 1,
  });

  const paths = [];

  page?.results?.forEach(post => {
    paths?.push({
      params: {
        slug: post?.uid,
      },
    });
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('desafio', String(params?.slug), {});

  return {
    props: {
      post: response,
    },
  };
};
