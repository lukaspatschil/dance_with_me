export class FileEntity {
  constructor(
    public buffer: Buffer,
    public originalFileName: string,
    public mimetype: string,
    public encoding: string,
  ) {}

  fileName?: string;

  width?: number;

  height?: number;
}
