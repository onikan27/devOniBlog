import { Box, Image, Flex, Link } from '@chakra-ui/react'
import { Article } from 'src/components/page/articles/Article'
import { ArticleType } from 'types'
// import Link from 'next/link'

type props = {
  articles: ArticleType[]
}

export const Articles: React.FC<props> = ({ articles }) => {
  return (
    <Box w="100%">
      {articles?.map((el) => (
        <Box key={el.id} mb="32px">
          <Article article={el} />
        </Box>
      ))}
    </Box>
  )
}
