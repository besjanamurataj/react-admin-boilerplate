
type PageTitleProps = {
  title: string
  subTitle?: string 
}

export const PageTitle = ({ title, subTitle }: PageTitleProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subTitle && <p className="mt-1 text-sm text-muted-foreground">{subTitle}</p>}
      </div>
    </div>
  )
}
