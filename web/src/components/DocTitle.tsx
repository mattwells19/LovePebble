export const DocTitle = ({ children }: { children?: string }) => {
  if (children) {
    return <title>{`${children} | Love Pebble`}</title>;
  } else {
    return <title>Love Pebble</title>;
  }
};
