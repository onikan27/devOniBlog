import cheerio from 'cheerio'
import hljs from 'highlight.js'
import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Flex } from '@chakra-ui/react'
import Head from 'next/head'
import { DefaultLayout } from 'src/components/layout/DefaultLayout'
import { MainLayout } from 'src/components/layout/MainLayout'
import { ArticleType } from 'types'
import { TagType } from 'types'
import { ApiKey } from 'utils/api-key'
import { RightSideBar } from 'src/components/molecules/RightSideBar'
import { Contents } from 'src/components/page/articles/contents'

type props = {
  article: ArticleType
  tags: TagType[]
  topics: any
}

const App: NextPage<props> = ({ article, tags, topics }) => {
  return (
    <>
      <Head>
        <title>Onikan-Blog：{article?.title}</title>
        <meta property="og:title" content={`Onikan-Blog：${article?.title}`} />
        <meta property="og:description" content={`${article.description}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.onikan-blog.com/" />
        <meta property="og:image" content={article.thumbnail.url} />
        <meta name="twitter:image" content={article.thumbnail.url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="og:site_name"
          content={`Onikan-Blog：${article?.title}`}
        />
        <meta name="twitter:site" content="@1027_onikan" />
        <meta name="twitter:title" content={`Onikan-Blog：${article?.title}`} />
        <meta name="twitter:description" content={`${article.description}`} />
      </Head>
      <DefaultLayout>
        <MainLayout>
          <Flex flexDirection="column" mb={{ sm: '32px', md: 0 }}>
            <Contents article={article} />
          </Flex>
          <RightSideBar tags={tags} topics={topics} />
        </MainLayout>
      </DefaultLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const key = ApiKey()
  const id = context?.params?.id as string
  const resArticle = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/articles?filters=id[equals]${id}`,
    key,
  )

  const article = await resArticle.json()

  const $ = cheerio.load(article.contents[0].body)

  $('pre > code').each((i, elm) => {
    const result = hljs.highlightAuto($(elm).text())
    $(elm).html(result.value)
    $(elm).addClass('hljs')
  })

  const resTags = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/tags`, key)
  const tags = await resTags.json()

  const resAllTopics = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/topics?fields=name,articles`,
    key,
  )

  const allTopics = await resAllTopics.json()

  return {
    props: {
      article: article.contents[0],
      tags: tags.contents,
      topics: allTopics.contents,
    },
    revalidate: 60,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const key = ApiKey()

  const resArticle = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/articles?fields=id`,
    key,
  )

  const article = await resArticle.json()

  const paths = article.contents.map(
    (path: { id: string }) => `/articles/${path.id}`,
  )

  return { paths, fallback: 'blocking' }
}

export default App
