type BlockLike = {
  block_id: string;
};

export function getBlockDisplayName(blocks: BlockLike[] | undefined, block: BlockLike | null | undefined) {
  if (!block) {
    return 'Block';
  }

  const index = blocks?.findIndex(item => item.block_id === block.block_id) ?? -1;
  return `Block-${index >= 0 ? index + 1 : 1}`;
}
