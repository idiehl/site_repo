type SectionHeaderProps = {
  title: string
  description?: string
}

const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

export default SectionHeader
