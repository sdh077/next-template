export interface items {
    foo: string;
    bar: string;
  }
  
  export default function Layout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: {
      foo: string;
      items: items;
      age: number;
  
    };
  }) {
  
    params.foo = "bar"; //string example
  
    params.items = { foo: "bar", bar: "foo" }; //object example
  
    params.age= 1; //number example
  
    return (
      <div>{children}</div>
    );
  }