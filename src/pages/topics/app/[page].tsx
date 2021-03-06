import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { Box, Text, Flex } from '@chakra-ui/react'
import Head from 'next/head'
import { DefaultLayout } from 'src/components/layout/DefaultLayout'
import { MainLayout } from 'src/components/layout/MainLayout'
import { Articles } from 'src/components/page/articles/Articles'
import { ArticleType } from 'types'
import { TagType } from 'types'
import { ApiKey } from 'utils/api-key'
import { RightSideBar } from 'src/components/molecules/RightSideBar'
import { Pagenation } from 'src/components/atoms/pagenation'

const PER_PAGE = 5

type props = {
  articles: ArticleType[]
  tags: TagType[]
  topics: any
  totalArticlesCount: number
}

const App: NextPage<props> = ({
  articles,
  tags,
  topics,
  totalArticlesCount,
}) => {
  return (
    <>
      <Head>
        <title>Onikan-Blog：APP</title>
        <meta property="og:site_name" content={`Onikan-Blog：APP`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@1027_onikan" />
        <meta name="twitter:title" content={`Onikan-Blog：APP`} />
        <meta property="og:url" content="https://www.onikan-blog.com/" />
        <meta property="og:type" content="website" />
      </Head>
      <DefaultLayout>
        <MainLayout>
          <Flex flexDirection="column">
            <Box mb="32px" ml={{ sm: '8px', md: 0 }}>
              <Text fontSize="32px" fontWeight="bold">
                App
              </Text>
            </Box>
            <Articles articles={articles} />
            {totalArticlesCount > 5 && (
              <Box mx="auto" mb="16px">
                <Pagenation
                  totalCount={totalArticlesCount}
                  pathName={`/topics/app/`}
                />
              </Box>
            )}
          </Flex>
          <RightSideBar tags={tags} topics={topics} />
        </MainLayout>
      </DefaultLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const page = Number(context?.params?.page ? context?.params?.page : 1)
  const key = ApiKey()
  const resTopics = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/topics?filters=name[contains]APP`,
    key,
  )
  const topics = await resTopics.json()

  const topicsAry = topics?.contents[0]?.articles

  topicsAry.sort((el: ArticleType, comparison: ArticleType) => {
    if (el.publishedAt < comparison.publishedAt) {
      return 1
    } else {
      return -1
    }
  })

  const articlesPages = topicsAry.slice((page - 1) * 5, (page - 1) * 5 + 5)

  const resTags = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT}/tags`, key)

  const tags = await resTags.json()

  const resAllTopics = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/topics?fields=name,articles`,
    key,
  )

  const allTopics = await resAllTopics.json()

  return {
    props: {
      articles: articlesPages,
      tags: tags.contents,
      topics: allTopics.contents,
      totalArticlesCount: topics?.contents[0]?.articles?.length,
    },
    revalidate: 60,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const key = ApiKey()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ENDPOINT}/topics?filters=name[contains]APP`,
    key,
  )

  const res_json = await res.json()

  const articlesPageCount = res_json?.contents[0]?.articles.length

  const range = (start: number, end: number) =>
    [...Array(end - start + 1)].map((_, i) => start + i)

  const paths = range(1, Math.ceil(articlesPageCount / PER_PAGE)).map(
    (page) => `/topics/app/${page}`,
  )

  return {
    paths,
    fallback: 'blocking',
  }
}

export default App
