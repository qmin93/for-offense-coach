interface UseCaseCardProps {
  title: string;
  description: string;
  icon: string;
}

const UseCaseCard = ({ title, description, icon }: UseCaseCardProps) => {
  return (
    <div className="glass-panel p-6 text-center hover:border-primary/30 transition-all duration-300 group">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default UseCaseCard;
