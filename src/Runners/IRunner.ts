interface IRunner {
	Run(): Promise<void>;
}
namespace IRunner {
	export const DIR_PARSE = 'data/Parse/';
	export const DIR_TESTS = 'data/Tests/';
};
export { IRunner };