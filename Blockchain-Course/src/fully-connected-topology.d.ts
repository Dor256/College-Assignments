declare module 'fully-connected-topology' {
    type TopologyEvent = 'connection' | 'data' | 'end';
    type Connection = {
        on(event: TopologyEvent, callback: (data: string) => void): void,
        setEncoding(encoding: string): void,
        write(data: string, callback?: () => void): void
    }
    type Topology = {
        on(event: TopologyEvent, callback: (connection: Connection, peer: string) => void): void
    }
    const topology: (myIp: string, peerIps: string[]) => Topology;
    export default topology;
}