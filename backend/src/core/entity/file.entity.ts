export class FileEntity {
  constructor(
    public buffer: Buffer,
    public originalFileName: string,
    public mimetype: string,
  ) {}

  fileName?: string;

  width?: number;

  height?: number;
}
