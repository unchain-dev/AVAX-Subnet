type Props = {
  message: string;
};

export default function AdminForm({ message }: Props) {
  return (
    <div className="bg-slate-300 p-5 m-10">
      <div>
        <div className="bg-slate-400 mb-3">
          <div>amount: {message}</div>
        </div>
      </div>
      <button className="bg-blue-400 float-right">button</button>
    </div>
  );
}
