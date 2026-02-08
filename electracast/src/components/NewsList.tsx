import { newsItems } from '../data/news'

const NewsList = () => {
  return (
    <div className="news-list">
      {newsItems.map((item) => (
        <article key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  )
}

export default NewsList
